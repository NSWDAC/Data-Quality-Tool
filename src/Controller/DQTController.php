<?php

declare(strict_types=1);

namespace Drupal\data_quality_tool\Controller;

use Drupal\Component\Utility\Html;
use Drupal\Component\Utility\Xss;
use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Render\Markup;
use Drupal\Core\Render\RendererInterface;
use JsonException;
use Mpdf\Mpdf;
use Mpdf\Output\Destination;
use PhpOffice\PhpWord\IOFactory;
use PhpOffice\PhpWord\PhpWord;
use PhpOffice\PhpWord\Style;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;

/**
 * Provides Data Quality Tool export controllers.
 */
class DQTController extends ControllerBase {

  /**
   * HTML tags allowed in generated PDF content.
   *
   * Tags that can load external resources are intentionally not allowed:
   * img, iframe, object, embed, link, style, script, svg, video, audio.
   */
  private const array PDF_ALLOWED_TAGS = [
    'p',
    'br',
    'strong',
    'b',
    'em',
    'i',
    'u',
    'ul',
    'ol',
    'li',
    'table',
    'thead',
    'tbody',
    'tr',
    'th',
    'td',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'span',
    'div',
  ];

  /**
   * Attributes that can load external resources or contain unsafe URLs/CSS.
   */
  private const array PDF_FORBIDDEN_ATTRIBUTES = [
    'src',
    'srcset',
    'href',
    'xlink:href',
    'data',
    'poster',
    'background',
    'style',
  ];

  /**
   * Constructs the controller.
   */
  public function __construct(
    private readonly RendererInterface $renderer,
  ) {}

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container): self {
    return new self(
      $container->get('renderer'),
    );
  }

  /**
   * Downloads XML statement data.
   */
  public function xml(Request $r): Response {
    $today = date('dMy');
    $content = (string) $r->get('xml-download-data', '');

    $resp = new Response($content);
    $resp->headers->set('Cache-Control', 'private, no-store');
    $resp->headers->set('Content-Description', 'File Transfer');
    $resp->headers->set('Content-Type', 'application/xml; charset=UTF-8');
    $resp->headers->set('Content-Length', (string) strlen($content));
    $resp->headers->set('Content-Transfer-Encoding', 'binary');
    $resp->headers->set('Content-Disposition', "attachment; filename=DataQualityTool_Statement_{$today}.xml");

    return $resp;
  }

  /**
   * Downloads DOCX statement data.
   */
  public function docx(Request $r): BinaryFileResponse {
    $todayHeader = $this->sanitizeFilenameValue(
      (string) $r->get('doc-date', date('d-M-y'))
    );

    $filename = tempnam(sys_get_temp_dir(), 'DOCX-DQT-');

    generateDOCX(
      (string) $r->get('doc-identify-data', ''),
      (string) $r->get('doc-contact-data', ''),
      (string) $r->get('doc-allsections-data', ''),
      $todayHeader,
      $filename
    );

    $resp = new BinaryFileResponse($filename);
    $resp->headers->set('Cache-Control', 'private, no-store');
    $resp->headers->set('Content-Description', 'File Transfer');
    $resp->headers->set('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    $resp->headers->set('Content-Transfer-Encoding', 'binary');
    $resp->setContentDisposition(ResponseHeaderBag::DISPOSITION_ATTACHMENT, "DataQualityTool_Statement_{$todayHeader}.docx");
    $resp->deleteFileAfterSend(TRUE);

    return $resp;
  }

  /**
   * Downloads PDF statement data.
   */
  public function pdf(Request $r): BinaryFileResponse {
    // User-supplied HTML must be sanitized before it is rendered by mPDF.
    $content = (string) $r->get('section_all', '');
    $content = $this->sanitizePdfHtml($content);

    $result = [
      '#theme' => 'dqt_pdf',
      // Safe only because sanitizePdfHtml() removes dangerous tags/attributes.
      '#content' => Markup::create($content),
    ];

    $output = (string) $this->renderer->renderRoot($result);

    $todayHeader = $this->sanitizeFilenameValue(
      (string) $r->get('pdf-date', date('d-M-y'))
    );

    $mpdf = new Mpdf([
      'tempDir' => sys_get_temp_dir(),
    ]);

    $mpdf->SetHTMLHeader(
      '<div style="text-align: center; font-weight: bold; margin-bottom: 30px; font-size: 10px;">' .
      Html::escape('NSW Government Data Quality Statement: ' . $todayHeader) .
      '</div>'
    );

    $mpdf->WriteHTML($output);

    $filename = tempnam(sys_get_temp_dir(), 'PDF-DQT-');
    $mpdf->Output($filename, Destination::FILE);

    $resp = new BinaryFileResponse($filename);
    $resp->headers->set('Cache-Control', 'private, no-store');
    $resp->headers->set('Content-Type', 'application/pdf');
    $resp->setContentDisposition(ResponseHeaderBag::DISPOSITION_ATTACHMENT, "DataQualityTool_Statement_{$todayHeader}.pdf");
    $resp->deleteFileAfterSend(TRUE);

    return $resp;
  }

  /**
   * Sanitizes user-controlled HTML before passing it to mPDF.
   *
   * This prevents SSRF by removing tags and attributes that can cause mPDF to
   * request internal or external resources during PDF generation.
   */
  private function sanitizePdfHtml(string $html): string {
    if ($html === '') {
      return '';
    }

    // Remove dangerous paired tags before XSS filtering.
    $html = preg_replace(
      '#<(script|style|iframe|object|embed|link|meta|base|svg|math|video|audio|source|track|picture)[^>]*>.*?</\1>#is',
      '',
      $html
    ) ?? '';

    // Remove standalone/self-closing dangerous tags.
    $html = preg_replace(
      '#<(script|style|iframe|object|embed|link|meta|base|svg|math|video|audio|source|track|picture|img)[^>]*\/?>#is',
      '',
      $html
    ) ?? '';

    // Keep only a small PDF-safe subset of HTML tags.
    $html = Xss::filter($html, self::PDF_ALLOWED_TAGS);

    return $this->removePdfUnsafeAttributes($html);
  }

  /**
   * Removes unsafe attributes from sanitized PDF HTML.
   *
   * Drupal Xss::filter() removes dangerous tags, but for PDF generation we
   * additionally remove attributes that could trigger mPDF resource loading.
   */
  private function removePdfUnsafeAttributes(string $html): string {
    if ($html === '') {
      return '';
    }

    // Remove JavaScript event handler attributes.
    $html = preg_replace(
      '/\s+on[a-z0-9_-]+\s*=\s*(?:"[^"]*"|\'[^\']*\'|[^\s>]+)/i',
      '',
      $html
    ) ?? '';

    foreach (self::PDF_FORBIDDEN_ATTRIBUTES as $attribute) {
      $quotedAttribute = preg_quote($attribute, '/');

      // Remove quoted and unquoted attribute variants.
      $html = preg_replace(
        '/\s+' . $quotedAttribute . '\s*=\s*(?:"[^"]*"|\'[^\']*\'|[^\s>]+)/i',
        '',
        $html
      ) ?? '';
    }

    return $html;
  }

  /**
   * Sanitizes a user-controlled value before using it in a filename.
   */
  private function sanitizeFilenameValue(string $value): string {
    $value = trim($value);

    if ($value === '') {
      return date('d-M-y');
    }

    $value = preg_replace('/[^A-Za-z0-9._-]/', '-', $value) ?? '';

    return $value !== '' ? $value : date('d-M-y');
  }

}

/**
 * Generates DOCX statement file.
 */
function generateDOCX($identifyJSONString, $contactJSONString, $allSectionsJSONString, $todayHeader, $filename): void {
  // Create a new document.
  $phpWord = new PhpWord();

  // Decode submitted JSON data used to build the DOCX statement.
  $identifyJSON = decodeSubmittedJson($identifyJSONString);
  $contactJSON = decodeSubmittedJson($contactJSONString);
  $allSectionsJSON = decodeSubmittedJson($allSectionsJSONString);

  // Define document styles.
  $dataNSWHeaderFont = ['name' => 'Arial', 'size' => 8, 'bold' => TRUE];
  $dataNSWHeaderParagraph = ['align' => 'center'];

  // Define general font styles.
  $generalFont = ['name' => 'Arial', 'size' => 11];
  $listParagraph = ['spaceAfter' => 100];
  $afterListParagraph = ['spaceBefore' => 200];
  $disclaimerFont = ['name' => 'Arial', 'size' => 10, 'bold' => TRUE];

  // Define section header styles.
  $sectionHeaderFont = ['name' => 'Arial', 'size' => 12, 'bold' => TRUE];
  $sectionHeaderParagraph = [
    'lineHeight' => 1,
    'indent' => 0.2,
    'spaceBefore' => 0,
    'spaceAfter' => 0,
  ];
  $sectionHeaderTable = [
    'width' => 50 * 100,
    'unit' => 'pct',
    'bgColor' => '002664',
    'cellMargin' => 200,
  ];
  $phpWord->addTableStyle('Section Header', $sectionHeaderTable);

  // Define stars table styles.
  $styleTable = ['cellMargin' => 100];
  $styleFirstRow = ['bgColor' => 'c60c30'];
  $styleTopCell = ['valign' => 'center'];
  $styleBottomCell = ['valign' => 'center', 'bgColor' => 'eeeeee'];
  $topFontStyle = [
    'bold' => TRUE,
    'align' => 'center',
    'color' => 'ffffff',
    'size' => 13,
  ];
  $bottomFontStyle = ['bold' => TRUE, 'size' => 11];
  $paragraphStyle = ['align' => 'center', 'spaceBefore' => 0, 'spaceAfter' => 0];
  $phpWord->addTableStyle('Stars Table', $styleTable, $styleFirstRow);

  // Define Identify question-answer table styles.
  $identifyQAStyleTable = [
    'cellMargin' => 200,
    'bgColor' => 'eeeeee',
    'borderTopSize' => 50,
    'borderTopColor' => 'ffffff',
  ];
  $styleIdentifyLeftCell = [
    'valign' => 'top',
    'bgColor' => '002664',
    'borderBottomSize' => 50,
    'borderBottomColor' => 'ffffff',
    'borderTopSize' => 50,
    'borderTopColor' => 'ffffff',
  ];
  $styleIdentifyRightCell = [
    'valign' => 'top',
    'bgColor' => 'eeeeee',
    'borderBottomSize' => 50,
    'borderBottomColor' => 'ffffff',
    'borderTopSize' => 50,
    'borderTopColor' => 'ffffff',
  ];
  $leftFontStyle = ['bold' => TRUE, 'color' => 'ffffff', 'size' => 11];
  $rightFontStyle = ['bold' => TRUE, 'size' => 11];
  $genericTableFont = ['name' => 'Arial', 'size' => 11];
  $genericTableHeadingFont = [
    'name' => 'Arial',
    'size' => 11,
    'bold' => TRUE,
    'italic' => TRUE,
    'spaceBefore' => 200,
  ];
  $genericTablePStyle = ['spaceBefore' => 0, 'spaceAfter' => 0];
  $phpWord->addTableStyle('Identify QA Table', $identifyQAStyleTable);

  // Define dimension header table styles.
  $dimensionStyleTable = ['cellMargin' => 200];
  $styleDimensionLeftCell = [
    'valign' => 'center',
    'bgColor' => 'c60c30',
    'borderBottomSize' => 50,
    'borderBottomColor' => 'ffffff',
    'borderTopSize' => 50,
    'borderTopColor' => 'ffffff',
  ];
  $styleDimensionRightCell = [
    'valign' => 'center',
    'bgColor' => 'eeeeee',
    'borderBottomSize' => 50,
    'borderBottomColor' => 'ffffff',
    'borderTopSize' => 50,
    'borderTopColor' => 'ffffff',
  ];
  $dimensionLeftFontStyle = ['bold' => TRUE, 'color' => 'ffffff', 'size' => 12];
  $phpWord->addTableStyle('Dimension Header', $dimensionStyleTable);

  // Define point table styles.
  $pointsTableFont = ['name' => 'Arial', 'size' => 11];
  $tickStyleTable = [
    'width' => 50 * 100,
    'unit' => 'pct',
    'bgColor' => 'eeeeee',
    'cellMargin' => 200,
  ];
  $crossStyleTable = [
    'width' => 50 * 100,
    'unit' => 'pct',
    'bgColor' => 'eeeeee',
    'cellMargin' => 200,
    'borderTopSize' => 50,
    'borderTopColor' => 'ffffff',
  ];
  $phpWord->addTableStyle('Tick Table', $tickStyleTable);
  $phpWord->addTableStyle('Cross Table', $crossStyleTable);

  // Create the main document section.
  $genericSection = $phpWord->addSection();

  // Add the document header.
  $dataNSWHeader = $genericSection->addHeader();

  // Add the header text.
  $dataNSWHeader->addText(
    htmlspecialchars('NSW Government Data Quality Statement: ' . $todayHeader),
    $dataNSWHeaderFont,
    $dataNSWHeaderParagraph
  );

  // Build the Identify section.
  $identifyQATable = $genericSection->addTable('Identify QA Table');

  // Add each Identify entry as a table row.
  foreach ($identifyJSON as $identifyItem) {
    $question = (string) ($identifyItem['question'] ?? '');
    $answer = (string) ($identifyItem['answer'] ?? '');

    if ($question === 'Data quality rating:') {
      if ((int) $answer === 0) {
        $identifyQATable->addRow(200);
        $identifyQATable
          ->addCell(4000, $styleIdentifyLeftCell)
          ->addText(htmlspecialchars($question), $leftFontStyle, $genericTablePStyle);
        $identifyQATable
          ->addCell(5000, $styleIdentifyRightCell)
          ->addText(htmlspecialchars('No Stars'), $rightFontStyle, $genericTablePStyle);
      }
      else {
        $identifyQATable->addRow(200);
        $identifyQATable
          ->addCell(3950, $styleIdentifyLeftCell)
          ->addText(htmlspecialchars($question), $leftFontStyle, $genericTablePStyle);

        $imageCell = $identifyQATable->addCell(5000, $styleIdentifyRightCell);

        foreach ($allSectionsJSON as $dimension) {
          if (!array_key_exists('star', $dimension) || is_null($dimension['star'])) {
            continue;
          }

          $dimensionName = ucwords(strtolower((string) ($dimension['section'] ?? '')));
          $dimensionTextRun = $imageCell->addTextRun((new Style\Paragraph())->setLineHeight(1.7));

          if ($dimension['star'] === 'true') {
            $dimensionTextRun->addImage(
              __DIR__ . '/../../../../../themes/custom/datansw/images/star_red.png',
              [
                'width' => 13,
                'height' => 13,
                'marginTop' => -1,
                'marginLeft' => 20,
                'marginRight' => 20,
                'wrappingStyle' => 'inline',
              ]
            );
          }
          else {
            $dimensionTextRun->addText(' - ', ['color' => 'c60c30']);
          }

          $dimensionTextRun->addText('  ' . $dimensionName, ['bold' => TRUE]);
        }

        $imageCell->addTextBreak(1);
      }
    }
    else {
      $identifyQATable->addRow(200);
      $identifyQATable
        ->addCell(4000, $styleIdentifyLeftCell)
        ->addText(htmlspecialchars($question), $leftFontStyle, $genericTablePStyle);
      $identifyQATable
        ->addCell(5000, $styleIdentifyRightCell)
        ->addText(htmlspecialchars($answer), $rightFontStyle, $genericTablePStyle);
    }
  }

  // Build dimension sections.
  foreach ($allSectionsJSON as $sectionItem) {
    $section = (string) ($sectionItem['section'] ?? '');
    $score = (string) ($sectionItem['score'] ?? '');
    $star = $sectionItem['star'] ?? NULL;
    $qaItems = $sectionItem['qa'] ?? [];

    if ($section !== 'RELEVANCE') {
      $dimensionHeaderTable = $genericSection->addTable('Identify QA Table');
      $dimensionHeaderTable->addRow(100);
      $dimensionHeaderTable
        ->addCell(4400, $styleDimensionLeftCell)
        ->addText($section, $dimensionLeftFontStyle, $genericTablePStyle);
      $dimensionHeaderTable
        ->addCell(3950, $styleDimensionRightCell)
        ->addText($score, $rightFontStyle, $genericTablePStyle);

      if ($star === 'true') {
        $dimensionHeaderTable
          ->addCell(650, $styleDimensionRightCell)
          ->addImage(
            __DIR__ . '/../../../../../themes/custom/datansw/images/star_red.png',
            [
              'width' => 20,
              'height' => 20,
              'wrappingStyle' => 'inline',
            ]
          );
      }
      elseif ($star === 'false') {
        $dimensionHeaderTable
          ->addCell(650, $styleDimensionRightCell)
          ->addImage(
            __DIR__ . '/../../../../../themes/custom/datansw/images/star_grey.png',
            [
              'width' => 20,
              'height' => 20,
              'wrappingStyle' => 'inline',
            ]
          );
      }
      else {
        $dimensionHeaderTable->addCell(650, $styleDimensionRightCell);
      }

      $doesTickExist = FALSE;
      $doesCrossExist = FALSE;
      $doesLinksExist = FALSE;

      foreach ($qaItems as $qaItem) {
        $qaType = (string) ($qaItem['type'] ?? '');

        if ($qaType === 'tick') {
          $doesTickExist = TRUE;
        }

        if ($qaType === 'cross') {
          $doesCrossExist = TRUE;
        }

        if ($qaType === 'links') {
          $doesLinksExist = TRUE;
        }
      }

      if ($doesTickExist) {
        $tickTable = $genericSection->addTable('Tick Table');
        $tickTable->addRow();
        $tickCell = $tickTable->addCell(9000);
      }

      if ($doesCrossExist) {
        $crossTable = $genericSection->addTable('Cross Table');
        $crossTable->addRow();
        $crossCell = $crossTable->addCell(9000);
      }

      $genericTable = $genericSection->addTable('Identify QA Table');
      $genericTable->addRow();
      $genericCell = $genericTable->addCell(9000);

      if ($doesLinksExist) {
        $genericTable->addRow();
        $linkCell = $genericTable->addCell(9000);
        $linkCell->addText(htmlspecialchars('Links to more information:'), $genericTableFont, $listParagraph);
      }

      foreach ($qaItems as $qaItem) {
        $qaType = (string) ($qaItem['type'] ?? '');
        $qaAnswer = htmlspecialchars(strip_tags((string) ($qaItem['answer'] ?? '')));

        if ($qaType === 'tick' && isset($tickCell)) {
          $tickCell->addListItem($qaAnswer, 0, $pointsTableFont, NULL, $listParagraph);
        }

        if ($qaType === 'cross' && isset($crossCell)) {
          $crossCell->addListItem($qaAnswer, 0, $pointsTableFont, NULL, $listParagraph);
        }

        if ($qaType === 'links' && isset($linkCell)) {
          $linkCell->addText($qaAnswer, $genericTableFont);
        }

        if ($qaType === 'text') {
          $genericCell->addText($qaAnswer, $genericTableFont);
        }
      }
    }
    else {
      $genericSection->addTextBreak(1);

      $relevanceTable = $genericSection->addTable('Section Header');
      $relevanceTable->addRow();
      $relevanceTable
        ->addCell(9000)
        ->addText(htmlspecialchars('Information to help users evaluate relevance'), $sectionHeaderFont, $sectionHeaderParagraph);

      $genericSection->addTextBreak(1);

      $scopeTable = $genericSection->addTable('Text Table');
      $scopeTable->addRow();
      $scopeCell = $scopeTable->addCell(9000);
      $scopeCell->addText(htmlspecialchars('Scope & Coverage:'), $genericTableHeadingFont);

      $genericSection->addTextBreak(1);

      $geoTable = $genericSection->addTable('Text Table');
      $geoTable->addRow();
      $geoCell = $geoTable->addCell(9000);
      $geoCell->addText(htmlspecialchars('Geographic detail:'), $genericTableHeadingFont);

      $genericSection->addTextBreak(1);

      $outputsTable = $genericSection->addTable('Text Table');
      $outputsTable->addRow();
      $outputsCell = $outputsTable->addCell(9000);
      $outputsCell->addText(htmlspecialchars('Outputs:'), $genericTableHeadingFont);

      $genericSection->addTextBreak(1);

      $otherTable = $genericSection->addTable('Text Table');
      $otherTable->addRow();
      $otherCell = $otherTable->addCell(9000);
      $otherCell->addText(htmlspecialchars('Other cautions:'), $genericTableHeadingFont);

      $genericSection->addTextBreak(1);

      $refTable = $genericSection->addTable('Text Table');
      $refTable->addRow();
      $refCell = $refTable->addCell(9000);
      $refCell->addText(htmlspecialchars('Reference period:'), $genericTableHeadingFont);

      $genericSection->addTextBreak(1);

      $timingTable = $genericSection->addTable('Text Table');
      $timingTable->addRow();
      $timingCell = $timingTable->addCell(9000);
      $timingCell->addText(htmlspecialchars('Timing:'), $genericTableHeadingFont);

      $genericSection->addTextBreak(1);

      $freqTable = $genericSection->addTable('Text Table');
      $freqTable->addRow();
      $freqCell = $freqTable->addCell(9000);
      $freqCell->addText(htmlspecialchars('Frequency of production:'), $genericTableHeadingFont);

      foreach ($qaItems as $qaItem) {
        $qaType = (string) ($qaItem['type'] ?? '');
        $qaAnswer = htmlspecialchars(strip_tags((string) ($qaItem['answer'] ?? '')));

        if ($qaType === 'scope') {
          $scopeCell->addText($qaAnswer, $genericTableFont);
        }

        if ($qaType === 'geo') {
          $geoCell->addText($qaAnswer, $genericTableFont);
        }

        if ($qaType === 'outputs') {
          $outputsCell->addText($qaAnswer, $genericTableFont);
        }

        if ($qaType === 'other') {
          $otherCell->addText($qaAnswer, $genericTableFont);
        }

        if ($qaType === 'ref') {
          $refCell->addText($qaAnswer, $genericTableFont);
        }

        if ($qaType === 'timing') {
          $timingCell->addText($qaAnswer, $genericTableFont);
        }

        if ($qaType === 'freq') {
          $freqCell->addText($qaAnswer, $genericTableFont);
        }
      }
    }
  }

  // Add the disclaimer section.
  $genericSection->addTextBreak(2);
  $genericSection->addText('DATA DISCLAIMER', $disclaimerFont);
  $genericSection->addText(
    'NSW Government is committed to producing data that is accurate, complete and useful. Notwithstanding its commitment to data quality, NSW Government gives no warranty as to the fitness of this data for a particular purpose. While every effort is made to ensure data quality, the data is provided “as is”. The burden for fitness of the data relies completely with the User. NSW Government shall not be held liable for improper or incorrect use of the data.',
    $disclaimerFont
  );

  // Build the Contact section.
  $genericSection->addTextBreak(1);
  $contactQATable = $genericSection->addTable('Identify QA Table');

  // Add each Contact entry as a table row.
  foreach ($contactJSON as $contactItem) {
    $question = (string) ($contactItem['question'] ?? '');
    $answer = (string) ($contactItem['answer'] ?? '');

    $contactQATable->addRow(200);
    $contactQATable
      ->addCell(4000, $styleIdentifyLeftCell)
      ->addText(htmlspecialchars($question), $leftFontStyle, $genericTablePStyle);
    $contactQATable
      ->addCell(5000, $styleIdentifyRightCell)
      ->addText(htmlspecialchars($answer), $rightFontStyle, $genericTablePStyle);
  }

  // Build the Data Quality Statement explanation section.
  $genericSection->addTextBreak(2);
  $understandingTable = $genericSection->addTable('Section Header');
  $understandingTable->addRow();
  $understandingTable
    ->addCell(9000)
    ->addText(htmlspecialchars('Understanding the Data Quality Statement'), $sectionHeaderFont, $sectionHeaderParagraph);

  $genericSection->addTextBreak(1);

  $genericSection->addText('The data quality statement aims to help you understand how a particular dataset could be used and whether it can be compared with other, similar datasets. It provides a description of the characteristics of the data to help you decide whether the data will be fit for your specific purpose.', $generalFont);
  $genericSection->addText(htmlspecialchars('About the data quality rating:'), $genericTableHeadingFont);
  $genericSection->addText('The reporting questionnaire asks five questions for each of these data quality dimensions:', $generalFont);

  $genericSection->addListItem('Institutional Environment', 0, $generalFont, NULL, $listParagraph);
  $genericSection->addListItem('Accuracy', 0, $generalFont, NULL, $listParagraph);
  $genericSection->addListItem('Coherence', 0, $generalFont, NULL, $listParagraph);
  $genericSection->addListItem('Interpretability', 0, $generalFont, NULL, $listParagraph);
  $genericSection->addListItem('Accessibility', 0, $generalFont, NULL, $listParagraph);

  $genericSection->addText('For each question: “yes” = 1 point; “no” = 0 points', $generalFont, $afterListParagraph);
  $genericSection->addText('The number of points determines the Quality Level for each dimension (high, medium, low).', $generalFont);
  $genericSection->addText('Only dimensions with four or five points receive a star.', $generalFont);

  $genericSection->addTextBreak(1);

  $starsTable = $genericSection->addTable('Stars Table');
  $starsTable->addRow(200);
  $starsTable->addCell(2000, $styleTopCell)->addText(htmlspecialchars('Points'), $topFontStyle, $paragraphStyle);
  $starsTable->addCell(2000, $styleTopCell)->addText(htmlspecialchars('Quality Level'), $topFontStyle, $paragraphStyle);
  $starsTable->addCell(2000, $styleTopCell)->addText(htmlspecialchars('Star / No Star'), $topFontStyle, $paragraphStyle);
  $starsTable->addRow(200);
  $starsTable->addCell(2000, $styleBottomCell)->addText(htmlspecialchars('0'), $bottomFontStyle, $paragraphStyle);
  $starsTable->addCell(2000, $styleBottomCell)->addText(htmlspecialchars('LOW'), $bottomFontStyle, $paragraphStyle);
  $starsTable->addCell(2000, $styleBottomCell)->addText(htmlspecialchars('No Star'), $bottomFontStyle, $paragraphStyle);
  $starsTable->addRow(200);
  $starsTable->addCell(2000, $styleBottomCell)->addText(htmlspecialchars('1'), $bottomFontStyle, $paragraphStyle);
  $starsTable->addCell(2000, $styleBottomCell)->addText(htmlspecialchars('LOW'), $bottomFontStyle, $paragraphStyle);
  $starsTable->addCell(2000, $styleBottomCell)->addText(htmlspecialchars('No Star'), $bottomFontStyle, $paragraphStyle);
  $starsTable->addRow(200);
  $starsTable->addCell(2000, $styleBottomCell)->addText(htmlspecialchars('2'), $bottomFontStyle, $paragraphStyle);
  $starsTable->addCell(2000, $styleBottomCell)->addText(htmlspecialchars('LOW'), $bottomFontStyle, $paragraphStyle);
  $starsTable->addCell(2000, $styleBottomCell)->addText(htmlspecialchars('No Star'), $bottomFontStyle, $paragraphStyle);
  $starsTable->addRow(200);
  $starsTable->addCell(2000, $styleBottomCell)->addText(htmlspecialchars('3'), $bottomFontStyle, $paragraphStyle);
  $starsTable->addCell(2000, $styleBottomCell)->addText(htmlspecialchars('MEDIUM'), $bottomFontStyle, $paragraphStyle);
  $starsTable->addCell(2000, $styleBottomCell)->addText(htmlspecialchars('No Star'), $bottomFontStyle, $paragraphStyle);
  $starsTable->addRow(200);
  $starsTable->addCell(2000, $styleBottomCell)->addText(htmlspecialchars('4'), $bottomFontStyle, $paragraphStyle);
  $starsTable->addCell(2000, $styleBottomCell)->addText(htmlspecialchars('MEDIUM'), $bottomFontStyle, $paragraphStyle);
  $starsTable->addCell(2000, $styleBottomCell)->addText(htmlspecialchars('Star'), $bottomFontStyle, $paragraphStyle);
  $starsTable->addRow(200);
  $starsTable->addCell(2000, $styleBottomCell)->addText(htmlspecialchars('5'), $bottomFontStyle, $paragraphStyle);
  $starsTable->addCell(2000, $styleBottomCell)->addText(htmlspecialchars('HIGH'), $bottomFontStyle, $paragraphStyle);
  $starsTable->addCell(2000, $styleBottomCell)->addText(htmlspecialchars('Star'), $bottomFontStyle, $paragraphStyle);

  $genericSection->addTextBreak(1);
  $genericSection->addText(htmlspecialchars('More information?'), $genericTableHeadingFont);
  $genericSection->addText('Find out more about the data quality dimensions, the reporting questionnaire and the star rating in the NSW Government Standard for Data Quality Reporting published at: https://data.nsw.gov.au/data-policy', $generalFont);
  $genericSection->addTextBreak(1);

  // Build the Evaluating data quality section.
  $understandingTable = $genericSection->addTable('Section Header');
  $understandingTable->addRow();
  $understandingTable
    ->addCell(9000)
    ->addText(htmlspecialchars('Evaluating data quality'), $sectionHeaderFont, $sectionHeaderParagraph);

  $genericSection->addTextBreak(1);

  $genericSection->addText('Quality relates to the data’s “fitness for purpose”. Users can make different assessments about the quality of the same data, depending on their “purpose” or the way they plan to use the data.', $generalFont);
  $genericSection->addText('The following questions may help you evaluate data quality for your requirements. This list is not exhaustive. Generate your own questions to assess data quality according to your specific needs and environment.', $generalFont);

  $genericSection->addListItem('What was the primary purpose or aim for collecting the data?', 0, $generalFont, NULL, $listParagraph);
  $genericSection->addListItem('How well does the coverage (and exclusions) match your needs?', 0, $generalFont, NULL, $listParagraph);
  $genericSection->addListItem('How useful are these data at small levels of geography?', 0, $generalFont, NULL, $listParagraph);
  $genericSection->addListItem('Does the population presented by the data match your needs?', 0, $generalFont, NULL, $listParagraph);
  $genericSection->addListItem('To what extent does the method of data collection seem appropriate for the information being gathered?', 0, $generalFont, NULL, $listParagraph);
  $genericSection->addListItem('Have standard classifications (eg industry or occupation classifications) been used in the collection of the data? If not, why? Does this affect the ability to compare or bring together data from different sources?', 0, $generalFont, NULL, $listParagraph);
  $genericSection->addListItem('Have rates and percentages been calculated consistently throughout the data?', 0, $generalFont, NULL, $listParagraph);
  $genericSection->addListItem('Is there a time difference between your reference period, and the reference period of the data?', 0, $generalFont, NULL, $listParagraph);
  $genericSection->addListItem('What is the gap of time between the reference period (when the data were collected) and the release date of the data?', 0, $generalFont, NULL, $listParagraph);
  $genericSection->addListItem('Will there be subsequent surveys or data collection exercises for this topic?', 0, $generalFont, NULL, $listParagraph);
  $genericSection->addListItem('Are there likely to be updates or revisions to the data after official release?', 0, $generalFont, NULL, $listParagraph);

  $genericSection->addTextBreak(1);

  // Save the document as an OOXML file.
  $objWriter = IOFactory::createWriter($phpWord, 'Word2007');
  $objWriter->save($filename);
}

/**
 * Decodes submitted JSON into an array.
 */
function decodeSubmittedJson(?string $json): array {
  $json = trim((string) $json);

  if ($json === '') {
    return [];
  }

  try {
    $decoded = json_decode($json, TRUE, 512, JSON_THROW_ON_ERROR);
  }
  catch (JsonException) {
    return [];
  }

  return is_array($decoded) ? $decoded : [];
}
