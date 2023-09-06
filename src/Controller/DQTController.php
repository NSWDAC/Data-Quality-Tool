<?php

namespace Drupal\data_quality_tool\Controller;

use Drupal\Core\Controller\ControllerBase;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;
use Symfony\Component\HttpFoundation\Request;

use PhpOffice\PhpWord\{PhpWord, Style};
use PhpOffice\PhpWord\IOFactory;


use Mpdf\Mpdf;
use Mpdf\Output\Destination;

class DQTController extends ControllerBase
{
  public function xml(Request $r)
  {
    $today = date('dMy');
    $content = $r->get('xml-download-data');
    $resp = new Response($content);
    $resp->headers->set('Cache-Control', 'public');
    $resp->headers->set('Content-Description', 'File Transfer');
    $resp->headers->set('Content-Type', 'application/octet-stream');
    $resp->headers->set('Content-Length', strlen($content));
    $resp->headers->set('Content-Transfer-Encoding', 'binary');
    $resp->headers->set('Content-Disposition', "attachment; filename=DataQualityTool_Statement_{$today}.xml");
    return $resp;
  }

  public function docx(Request $r)
  {
    $todayHeader = $r->get('doc-date', date('d-M-y'));
    $filename = tempnam('/tmp', 'DOCX-DQT');
    $content = generateDOCX(
      $r->get('doc-identify-data'),
      $r->get('doc-contact-data'),
      $r->get('doc-allsections-data'),
      $todayHeader,
      $filename
    );

    $resp = new BinaryFileResponse($filename);
    $resp->headers->set('Cache-Control', 'public');
    $resp->headers->set('Content-Description', 'File Transfer');
    $resp->headers->set('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    $resp->headers->set('Content-Transfer-Encoding', 'binary');
    $resp->setContentDisposition(ResponseHeaderBag::DISPOSITION_ATTACHMENT, "DataQualityTool_Statement_{$todayHeader}.docx");
    return $resp;
  }

  public function pdf(Request $r)
  {
    $content = $r->get('section_all');


    $result = [
      '#theme' => 'dqt_pdf',
      '#content' => $content
    ];
    $output = \Drupal::service('renderer')->renderRoot($result);

    $mpdf = new Mpdf();

    $todayHeader = date('d-M-y');
    $mpdf->SetHTMLHeader(
      '<div style="text-align: center; font-weight: bold; margin-bottom: 30px; font-size: 10px">' .
      'NSW Government Data Quality Statement: ' . $todayHeader . '</div>');

    $todayHeader = $r->get('pdf-date');

    // $stylesheet = file_get_contents('pdf.style.css');
    // $mpdf->WriteHTML($stylesheet, 1);
    $mpdf->WriteHTML($output);

    $filename = tempnam('/tmp', 'PDF-DQT');
    $mpdf->Output($filename, Destination::FILE);
    $resp = new BinaryFileResponse($filename);
    $resp->setContentDisposition(ResponseHeaderBag::DISPOSITION_ATTACHMENT, "DataQualityTool_Statement_{$todayHeader}.pdf");
    return $resp;
  }
}


function generateDOCX($identifyJSONString, $contactJSONString, $allSectionsJSONString, $todayHeader, $filename) {


  // Creating the new document...
  $phpWord = new PhpWord();


  ///////////////////////////////////////////////////////////////////////
  //                                DATA                               //
  ///////////////////////////////////////////////////////////////////////
  $identifyJSON 	 = json_decode($identifyJSONString ?? '', true) ?? [];
  $contactJSON 		 = json_decode($contactJSONString ?? '', true) ?? [];
  $allSectionsJSON = json_decode($allSectionsJSONString ?? '', true) ?? [];

  ///////////////////////////////////////////////////////////////////////
  //                               SYTLES                              //
  ///////////////////////////////////////////////////////////////////////
  // Header font styles
  $dataNSWHeaderFont = ['name' => 'Arial', 'size' => 8, 'bold' => true];
  $dataNSWHeaderParagraph = ['align' => 'center'];

  // General font styles
  $generalFont = ['name' => 'Arial', 'size' => 11];
  $listParagraph = ['spaceAfter' => 100];
  $afterListParagraph = ['spaceBefore' => 200];
  $disclaimerFont = ['name' => 'Arial', 'size' => 10, 'bold' => true];

  // Section header styles
  $sectionHeaderFont = ['name' => 'Arial', 'size' => 12, 'bold' => true];
  $sectionHeaderParagraph = ['lineHeight' => 1, 'indent' => 0.2, 'spaceBefore' => 0, 'spaceAfter' => 0];
  $sectionHeaderTable = ['width' => 50 * 100, 'unit' => 'pct', 'bgColor' => '002664', 'cellMargin' => 200];
  $phpWord->addTableStyle('Section Header', $sectionHeaderTable);
  $cellColSpan = ['gridSpan' => 20, 'valign' => 'center'];
  $sectionHeaderTable = ['width' => 50 * 100, 'unit' => 'pct', 'bgColor' => '002664', 'cellMargin' => 200];

  // Stars Table styles
  $styleTable = ['cellMargin' => 100];
  $styleFirstRow = ['bgColor' => 'c60c30'];
  $styleTopCell = ['valign' => 'center'];
  $styleBottomCell = ['valign' => 'center', 'bgColor' => 'eeeeee'];
  $topFontStyle = ['bold' => true, 'align' => 'center', 'color' => 'ffffff', 'size' => 13];
  $bottomFontStyle = ['bold' => true, 'size' => 11];
  $paragraphStyle = ['align' => 'center', 'spaceBefore' => 0, 'spaceAfter' => 0];
  $phpWord->addTableStyle('Stars Table', $styleTable, $styleFirstRow);

  // Identify Question Answer table styles
  $identifyQAStyleTable = ['cellMargin' => 200, 'bgColor' => 'eeeeee', 'borderTopSize' => 50, 'borderTopColor' => 'ffffff'];
  $styleIdentifyLeftCell = ['valign' => 'top', 'bgColor' => '002664', 'borderBottomSize' => 50, 'borderBottomColor' => 'ffffff', 'borderTopSize' => 50, 'borderTopColor' => 'ffffff'];
  $styleIdentifyRightCell = ['valign' => 'top', 'bgColor' => 'eeeeee', 'borderBottomSize' => 50, 'borderBottomColor' => 'ffffff', 'borderTopSize' => 50, 'borderTopColor' => 'ffffff'];
  $leftFontStyle = ['bold' => true, 'color' => 'ffffff', 'size' => 11];
  $rightFontStyle = ['bold' => true, 'size' => 11];
  $genericTableFont = ['name' => 'Arial', 'size' => 11];
  $genericTableHeadingFont = ['name' => 'Arial', 'size' => 11, 'bold' => true, 'italic' => true, 'spaceBefore' => 200];
  $genericTablePStyle = ['spaceBefore' => 0, 'spaceAfter' => 0];
  $phpWord->addTableStyle('Identify QA Table', $identifyQAStyleTable);

  // Generic Question Answer table styles
  $styleGenericLeftCell = ['valign' => 'top', 'bgColor' => 'c60c30', 'borderBottomSize' => 50, 'borderBottomColor' => 'ffffff', 'borderTopSize' => 50, 'borderTopColor' => 'ffffff'];
  $qaRightFontStyle = ['size' => 12];

  // Dimension Header table styles
  $dimensionStyleTable = ['cellMargin' => 200];
  $styleDimensionLeftCell = ['valign' => 'center', 'bgColor' => 'c60c30', 'borderBottomSize' => 50, 'borderBottomColor' => 'ffffff', 'borderTopSize' => 50, 'borderTopColor' => 'ffffff'];
  $styleDimensionRightCell = ['valign' => 'center', 'bgColor' => 'eeeeee', 'borderBottomSize' => 50, 'borderBottomColor' => 'ffffff', 'borderTopSize' => 50, 'borderTopColor' => 'ffffff'];
  $sectionHeaderTablePStyle = ['spaceBefore' => 200, 'spaceAfter' => 0];
  $dimensionLeftFontStyle = ['bold' => true, 'color' => 'ffffff', 'size' => 12];
  $phpWord->addTableStyle('Dimension Header', $dimensionStyleTable);

  // Points table styles
  $pointsTableFont = ['name' => 'Arial', 'size' => 11];
  $tickStyleTable = ['width' => 50 * 100, 'unit' => 'pct', 'bgColor' => 'eeeeee', 'cellMargin' => 200];
  $crossStyleTable = ['width' => 50 * 100, 'unit' => 'pct', 'bgColor' => 'eeeeee', 'cellMargin' => 200, 'borderTopSize' => 50, 'borderTopColor' => 'ffffff'];
  $phpWord->addTableStyle('Tick Table', $tickStyleTable);
  $phpWord->addTableStyle('Cross Table', $crossStyleTable);
  $pointsTable = ['width' => 50 * 100, 'unit' => 'pct', 'bgColor' => '002664', 'cellMargin' => 200];


  /* ------------ ------------ SECTIONS ------------ ------------ */
  $genericSection = $phpWord->addSection();



  /* ------------ ------------ Header ------------ ------------ */
  // Header of the document
  $dataNSWHeader = $genericSection->addHeader();


  // Adding header text
  $dataNSWText = $dataNSWHeader->addText(
    htmlspecialchars('NSW Government Data Quality Statement: '.$todayHeader), $dataNSWHeaderFont, $dataNSWHeaderParagraph
  );

  /* ------------ ------------ Identify Section ------------ ------------ */
  $identifyQATable = $genericSection->addTable('Identify QA Table');

  // Loop through all of the Identify data and for each entry add a row to the table with it's data
  for ($i = 0; $i < sizeOf($identifyJSON); $i++) {

    if ($identifyJSON[$i]['question'] == "Data quality rating:") {

      if ($identifyJSON[$i]['answer'] == 0){
	$identifyQATable->addRow(200);
	$identifyQATable->addCell(4000, $styleIdentifyLeftCell)->addText(htmlspecialchars($identifyJSON[$i]['question']), $leftFontStyle, $genericTablePStyle);
	$identifyQATable->addCell(5000, $styleIdentifyRightCell)->addText(htmlspecialchars("No Stars"), $rightFontStyle, $genericTablePStyle);
      }
      else {
	$identifyQATable->addRow(200);
	$identifyQATable->addCell(3950, $styleIdentifyLeftCell)->addText(htmlspecialchars($identifyJSON[$i]['question']), $leftFontStyle, $genericTablePStyle);
	$imageCell = $identifyQATable->addCell(5000, $styleIdentifyRightCell);
	$imageTextRun = $imageCell->createTextRun();


	foreach ($allSectionsJSON as $key => $dimension) {
	  if (is_null($dimension['star'])) continue;

	  $dimensionName = ucwords(strtolower($dimension['section']));
	  $dimensionTextRun_[$key] = $imageCell->addTextRun((new Style\Paragraph())->setLineHeight(1.7));

	  if ($dimension['star'] === 'true') {
	    $dimensionTextRun_[$key]->addImage(
              __DIR__ . '/../../../../../themes/custom/datansw/images/star_red.png',
              array(
                'width' => 13,
                'height' => 13,
                'marginTop' => -1,
                'marginLeft' => 20,
                'marginRight' => 20,
                'wrappingStyle' => 'inline'
              ));
	  }
	  else {
	    $dimensionTextRun_[$key]->addText(' - ', array('color' => 'c60c30'));
	  }
	  $dimensionTextRun_[$key]->addText('  ' . $dimensionName, array('bold' => true));
	}
	$imageCell->addTextBreak(1);
      }
    }
    else {
      $identifyQATable->addRow(200);
      $identifyQATable->addCell(4000, $styleIdentifyLeftCell)->addText(htmlspecialchars($identifyJSON[$i]['question']), $leftFontStyle, $genericTablePStyle);
      $identifyQATable->addCell(5000, $styleIdentifyRightCell)->addText(htmlspecialchars($identifyJSON[$i]['answer']), $rightFontStyle, $genericTablePStyle);
    }
  }

  /* ------------ ------------ ------------ ------------ ------------ */

  /* ------------ Dimensions ------------ */
  for ($x = 0; $x < sizeOf($allSectionsJSON); $x++) {

    if ($allSectionsJSON[$x]['section'] != "RELEVANCE" ) {

      $dimensionHeaderTable = $genericSection->addTable('Identify QA Table');
      $dimensionHeaderTable->addRow(100);
      $dimensionHeaderTable->addCell(4400, $styleDimensionLeftCell)->addText($allSectionsJSON[$x]['section'], $dimensionLeftFontStyle, $genericTablePStyle);
      $dimensionHeaderTable->addCell(3950, $styleDimensionRightCell)->addText($allSectionsJSON[$x]['score'], $rightFontStyle, $genericTablePStyle);

      if ($allSectionsJSON[$x]['star'] == "true") {

	$dimensionHeaderTable->addCell(650, $styleDimensionRightCell)->addImage(
          __DIR__ . '/../../../../../themes/custom/datansw/images/star_red.png',
          array(
            'width' => 20,
            'height' => 20,
            'wrappingStyle' => 'inline'
          ));

      }
      else if ($allSectionsJSON[$x]['star'] == "false") {

	$dimensionHeaderTable->addCell(650, $styleDimensionRightCell)->addImage(
          __DIR__ . '/../../../../../themes/custom/datansw/images/star_grey.png',
          array(
            'width' => 20,
            'height' => 20,
            'wrappingStyle' => 'inline'
          ));
      }
      else {
	$dimensionHeaderTable->addCell(650, $styleDimensionRightCell);
      }

      $doesTickExist = false;
      $doesCrossExist = false;
      $doesLinksExist = false;

      for ($g = 0; $g < sizeOf($allSectionsJSON[$x]['qa']); $g++) {

	if ($allSectionsJSON[$x]['qa'][$g]['type'] == "tick") { $doesTickExist = true; }
      }

      for ($c = 0; $c < sizeOf($allSectionsJSON[$x]['qa']); $c++) {

	if ($allSectionsJSON[$x]['qa'][$c]['type'] == "cross") { $doesCrossExist = true; }
      }

      for ($h = 0; $h < sizeOf($allSectionsJSON[$x]['qa']); $h++) {

	if ($allSectionsJSON[$x]['qa'][$h]['type'] == "links") { $doesLinksExist = true; }
      }

      if ($doesTickExist == true) {
	$tickTable = $genericSection->addTable('Tick Table');
	$tickTable->addRow();
	$tickCell = $tickTable->addCell(9000);
      }

      if ($doesCrossExist == true) {
	$crossTable = $genericSection->addTable('Cross Table');
	$crossTable->addRow();
	$crossCell = $crossTable->addCell(9000);
      }

      $genericTable = $genericSection->addTable('Identify QA Table');
      $genericTable->addRow();
      $genericCell = $genericTable->addCell(9000);

      if ($doesLinksExist == true) {
	$genericTable->addRow();
	$linkCell = $genericTable->addCell(9000);
	$linkCell->addText(htmlspecialchars("Links to more information:"), $genericTableFont, $listParagraph);
      }

      for ($p = 0; $p < sizeOf($allSectionsJSON[$x]['qa']); $p++) {

	if ($allSectionsJSON[$x]['qa'][$p]['type'] == "tick") {
	  $tickCell->addListItem(htmlspecialchars(strip_tags($allSectionsJSON[$x]['qa'][$p]['answer'])), 0, $pointsTableFont, null, $listParagraph);
	}

	if ($allSectionsJSON[$x]['qa'][$p]['type'] == "cross") {
	  $crossCell->addListItem(htmlspecialchars(strip_tags($allSectionsJSON[$x]['qa'][$p]['answer'])), 0, $pointsTableFont, null, $listParagraph);
	}

	if ($allSectionsJSON[$x]['qa'][$p]['type'] == "links") {

	  $linkCell->addText(htmlspecialchars(strip_tags($allSectionsJSON[$x]['qa'][$p]['answer'])), $genericTableFont);

	}

	if ($allSectionsJSON[$x]['qa'][$p]['type'] == "text") {

	  $genericCell->addText(htmlspecialchars(strip_tags($allSectionsJSON[$x]['qa'][$p]['answer'])), $genericTableFont);

	}

      }
    }

    else if ($allSectionsJSON[$x]['section'] == "RELEVANCE" ) {

      $genericSection->addTextBreak(1);

      $relevanceTable = $genericSection->addTable('Section Header');
      $relevanceTable->addRow();
      $relevanceTable->addCell(9000)->addText(htmlspecialchars("Information to help users evaluate relevance"), $sectionHeaderFont, $sectionHeaderParagraph);

      $genericSection->addTextBreak(1);

      $scopeTable = $genericSection->addTable('Text Table');
      $scopeTable->addRow();
      $scopeCell = $scopeTable->addCell(9000);
      $scopeCell->addText(htmlspecialchars("Scope & Coverage:"), $genericTableHeadingFont);

      $genericSection->addTextBreak(1);

      $geoTable = $genericSection->addTable('Text Table');
      $geoTable->addRow();
      $geoCell = $geoTable->addCell(9000);
      $geoCell->addText(htmlspecialchars("Geographic detail:"), $genericTableHeadingFont);

      $genericSection->addTextBreak(1);

      $outputsTable = $genericSection->addTable('Text Table');
      $outputsTable->addRow();
      $outputsCell = $outputsTable->addCell(9000);
      $outputsCell->addText(htmlspecialchars("Outputs:"), $genericTableHeadingFont);

      $genericSection->addTextBreak(1);

      $otherTable = $genericSection->addTable('Text Table');
      $otherTable->addRow();
      $otherCell = $otherTable->addCell(9000);
      $otherCell->addText(htmlspecialchars("Other cautions:"), $genericTableHeadingFont);

      $genericSection->addTextBreak(1);

      $refTable = $genericSection->addTable('Text Table');
      $refTable->addRow();
      $refCell = $refTable->addCell(9000);
      $refCell->addText(htmlspecialchars("Reference period:"), $genericTableHeadingFont);

      $genericSection->addTextBreak(1);

      $timingTable = $genericSection->addTable('Text Table');
      $timingTable->addRow();
      $timingCell = $timingTable->addCell(9000);
      $timingCell->addText(htmlspecialchars("Timing:"), $genericTableHeadingFont);

      $genericSection->addTextBreak(1);

      $freqTable = $genericSection->addTable('Text Table');
      $freqTable->addRow();
      $freqCell = $freqTable->addCell(9000);
      $freqCell->addText(htmlspecialchars("Frequency of production:"), $genericTableHeadingFont);



      for ($j = 0; $j < sizeOf($allSectionsJSON[$x]['qa']); $j++) {

	//print $allSectionsJSON[$x]['qa'][$p]['question'];

	if ($allSectionsJSON[$x]['qa'][$j]['type'] == "scope") {
	  $scopeCell->addText(htmlspecialchars(strip_tags($allSectionsJSON[$x]['qa'][$j]['answer'])), $genericTableFont);
	}

	if ($allSectionsJSON[$x]['qa'][$j]['type'] == "geo") {
	  $geoCell->addText(htmlspecialchars(strip_tags($allSectionsJSON[$x]['qa'][$j]['answer'])), $genericTableFont);
	}

	if ($allSectionsJSON[$x]['qa'][$j]['type'] == "outputs") {
	  $outputsCell->addText(htmlspecialchars(strip_tags($allSectionsJSON[$x]['qa'][$j]['answer'])), $genericTableFont);
	}

	if ($allSectionsJSON[$x]['qa'][$j]['type'] == "other") {
	  $otherCell->addText(htmlspecialchars(strip_tags($allSectionsJSON[$x]['qa'][$j]['answer'])), $genericTableFont);
	}

	if ($allSectionsJSON[$x]['qa'][$j]['type'] == "ref") {
	  $refCell->addText(htmlspecialchars(strip_tags($allSectionsJSON[$x]['qa'][$j]['answer'])), $genericTableFont);
	}

	if ($allSectionsJSON[$x]['qa'][$j]['type'] == "timing") {
	  $timingCell->addText(htmlspecialchars(strip_tags($allSectionsJSON[$x]['qa'][$j]['answer'])), $genericTableFont);
	}

	if ($allSectionsJSON[$x]['qa'][$j]['type'] == "freq") {
	  $freqCell->addText(htmlspecialchars(strip_tags($allSectionsJSON[$x]['qa'][$j]['answer'])), $genericTableFont);
	}

      }


    }

  }

  /* ------------ ------------ ------------ ------------ ------------ */

  $genericSection->addTextBreak(2);

  $genericSection->addText('DATA DISCLAIMER', $disclaimerFont);
  $genericSection->addText('NSW Government is committed to producing data that is accurate, complete and useful. Notwithstanding its commitment to data quality, NSW Government gives no warranty as to the fitness of this data for a particular purpose. While every effort is made to ensure data quality, the data is provided “as is”. The burden for fitness of the data relies completely with the User. NSW Government shall not be held liable for improper or incorrect use of the data.', $disclaimerFont);


  /* ------------ ------------ Contact Section ------------ ------------ */
  $genericSection->addTextBreak(1);
  $contactQATable = $genericSection->addTable('Identify QA Table');

  // Loop through all of the Identify data and for each entry add a row to the table with it's data
  for ($i = 0; $i < sizeOf($contactJSON); $i++) {

    $contactQATable->addRow(200);
    $contactQATable->addCell(4000, $styleIdentifyLeftCell)->addText(htmlspecialchars($contactJSON[$i]['question']), $leftFontStyle, $genericTablePStyle);
    $contactQATable->addCell(5000, $styleIdentifyRightCell)->addText(htmlspecialchars($contactJSON[$i]['answer']), $rightFontStyle, $genericTablePStyle);
  }

  /* ------------ ------------ ------------ ------------ ------------ */

  /* ------------ Understanding the Data Quality Statement ------------ */
  $genericSection->addTextBreak(2);
  $understandingTable = $genericSection->addTable('Section Header');
  $understandingTable->addRow();
  $understandingTable->addCell(9000)->addText(htmlspecialchars("Understanding the Data Quality Statement"), $sectionHeaderFont, $sectionHeaderParagraph);

  $genericSection->addTextBreak(1);

  $genericSection->addText('The data quality statement aims to help you understand how a particular dataset could be used and whether it can be compared with other, similar datasets. It provides a description of the characteristics of the data to help you decide whether the data will be fit for your specific purpose.', $generalFont);

  $genericSection->addText(htmlspecialchars("About the data quality rating:"), $genericTableHeadingFont);

  $genericSection->addText('The reporting questionnaire asks five questions for each of these data quality dimensions:', $generalFont);

  $genericSection->addListItem('Institutional Environment', 0, $generalFont, null, $listParagraph);
  $genericSection->addListItem('Accuracy', 0, $generalFont, null, $listParagraph);
  $genericSection->addListItem('Coherence', 0, $generalFont, null, $listParagraph);
  $genericSection->addListItem('Interpretability', 0, $generalFont, null, $listParagraph);
  $genericSection->addListItem('Accessibility', 0, $generalFont, null, $listParagraph);

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

  $genericSection->addText(htmlspecialchars("More information?"), $genericTableHeadingFont);

  $genericSection->addText('Find out more about the data quality dimensions, the reporting questionnaire and the star rating in the NSW Government Standard for Data Quality Reporting published at: https://data.nsw.gov.au/data-policy', $generalFont);

	$genericSection->addTextBreak(1);

	/* ------------ ------------ ------------ ------------ ------------ */


	/* ------------ Evaluating data quality ------------ */
	$understandingTable = $genericSection->addTable('Section Header');
	$understandingTable->addRow();
	$understandingTable->addCell(9000)->addText(htmlspecialchars("Evaluating data quality"), $sectionHeaderFont, $sectionHeaderParagraph);

	$genericSection->addTextBreak(1);

	$genericSection->addText('Quality relates to the data’s “fitness for purpose”. Users can make different assessments about the quality of the same data, depending on their “purpose” or the way they plan to use the data.', $generalFont);
	$genericSection->addText('The following questions may help you evaluate data quality for your requirements. This list is not exhaustive. Generate your own questions to assess data quality according to your specific needs and environment.', $generalFont);

	$genericSection->addListItem('What was the primary purpose or aim for collecting the data?', 0, $generalFont, null, $listParagraph);
	$genericSection->addListItem('How well does the coverage (and exclusions) match your needs?', 0, $generalFont, null, $listParagraph);
	$genericSection->addListItem('How useful are these data at small levels of geography?', 0, $generalFont, null, $listParagraph);
	$genericSection->addListItem('Does the population presented by the data match your needs?', 0, $generalFont, null, $listParagraph);
	$genericSection->addListItem('To what extent does the method of data collection seem appropriate for the information being gathered?', 0, $generalFont, null, $listParagraph);
	$genericSection->addListItem('Have standard classifications (eg industry or occupation classifications) been used in the collection of the data? If not, why? Does this affect the ability to compare or bring together data from different sources?', 0, $generalFont, null, $listParagraph);
	$genericSection->addListItem('Have rates and percentages been calculated consistently throughout the data?', 0, $generalFont, null, $listParagraph);
	$genericSection->addListItem('Is there a time difference between your reference period, and the reference period of the data?', 0, $generalFont, null, $listParagraph);
	$genericSection->addListItem('What is the gap of time between the reference period (when the data were collected) and the release date of the data?', 0, $generalFont, null, $listParagraph);
	$genericSection->addListItem('Will there be subsequent surveys or data collection exercises for this topic?', 0, $generalFont, null, $listParagraph);
	$genericSection->addListItem('Are there likely to be updates or revisions to the data after official release?', 0, $generalFont, null, $listParagraph);

	$genericSection->addTextBreak(1);

	/* ------------ ------------ ------------ ------------ ------------ */
	// Saving the document as OOXML file...
	$objWriter = IOFactory::createWriter($phpWord, 'Word2007');
	$objWriter->save($filename);
}
