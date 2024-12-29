import './App.css';
import ShirtSvgPyro from './ShirtSvgPyro'
import ShirtSvgMegafoon from './ShirtSvgMegafoon'
import ShirtSvgMegafoonV2 from './ShirtSvgMegafoonV2'
import ShirtSvgSjaal from './ShirtSvgSjaal'
import ShirtSvgBadge from './ShirtSvgBadge'
import { useState, useRef } from 'react';
import Form from 'react-bootstrap/Form';
import Image from 'react-bootstrap/Image';
import { Canvg } from 'canvg';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import {changeDpiDataUrl} from "changedpi";
import {FileUploader} from "react-drag-drop-files";
import {ProgressBar, Spinner, Tab, Tabs} from "react-bootstrap";
import Papa from "papaparse";
import {renderToString} from "react-dom/server";
import JSZip from "jszip";

const fileTypes = ["JPG", "PNG", "GIF"];
const SHIRT_DESIGNS = ["PYRO", "MEGAFOON", "MEGAFOONV2", "SJAAL", 'BADGE']

function App() {
    const [primaryColor, setPrimaryColor] = useState('#ff0000');
    const [secondaryColor, setSecondaryColor] = useState('#ffffff');
    const [tertiaryColor, setTertiaryColor] = useState('#ff00ff');
    const [quartiaryColor, setQuartiaryColor] = useState('#00ff00');
    const [previewLogo, setPreviewLogo] = useState('');
    const [textColor, setTextColor] = useState('#ffffff');
    const [textBorderColor, setTextBorderColor] = useState('#ff0000');
    const [shirtText, setShirtText] = useState('Enschede');
    const [shirtNumber, setShirtNumber] = useState('1965');
    const [loading, setLoading] = useState(false);
    const [importedCsv, setImportedCsv] = useState(null);
    const [shirtDesign, setShirtDesign] = useState('PYRO');
    const [downloadAll, setDownloadAll] = useState(false)


    function handlePrimaryColorChange(event) {
        setPrimaryColor(event.target.value)
    }

    function handleSecondaryColorChange(event) {
        setSecondaryColor(event.target.value);
    }

    function handleTertiaryColorChange(event) {
        setTertiaryColor(event.target.value);
    }

    function handleQuartiaryColorChange(event) {
        setQuartiaryColor(event.target.value);
    }

    function handleTextColorChange(event) {
        setTextColor(event.target.value);
    }

    function handleTextBorderColorChange(event) {
        setTextBorderColor(event.target.value);
    }

    function handleShirtTextChange(event) {
        setShirtText(event.target.value);
    }

    function handleSetShirtNumber(event) {
        setShirtNumber(event.target.value);
    }

    function handlePreviewLogoChange(file) {
        setPreviewLogo(file);
    }

    function handleImportedCsvChange(event) {
        setImportedCsv(event.target.files[0]);
    }

    function handleShirtDesignChange(event) {
        setShirtDesign(event.target.value);
    }

    function handleDownloadAllChange(event) {
        setDownloadAll(event.target.checked);
    }

    function handleCompleteShirtChange(shirtConfig, optionalShirtDesign) {
        let svgReactElement
        let localShirtDesign = optionalShirtDesign || shirtDesign
        switch(localShirtDesign) {
            case 'PYRO': 
                svgReactElement = ( <ShirtSvgPyro
                    primaryColor={shirtConfig.primaryColor}
                    secondaryColor={shirtConfig.secondaryColor}
                    tertiaryColor={shirtConfig.tertiaryColor}
                    quartiaryColor={shirtConfig.quartiaryColor}
                    textColor={shirtConfig.textColor}
                    textBorderColor={shirtConfig.textBorderColor}
                    shirtText={shirtConfig.shirtText}
                    shirtNumber={shirtConfig.shirtNumber}
                />)
                break;
            case 'MEGAFOON': 
                svgReactElement = ( <ShirtSvgMegafoon
                    primaryColor={shirtConfig.primaryColor}
                    secondaryColor={shirtConfig.secondaryColor}
                    tertiaryColor={shirtConfig.tertiaryColor}
                    quartiaryColor={shirtConfig.quartiaryColor}
                    textColor={shirtConfig.textColor}
                    textBorderColor={shirtConfig.textBorderColor}
                    shirtText={shirtConfig.shirtText}
                    shirtNumber={shirtConfig.shirtNumber}
                />)
                break;
            case 'MEGAFOONV2':     
                svgReactElement = ( <ShirtSvgMegafoonV2
                    primaryColor={shirtConfig.primaryColor}
                    secondaryColor={shirtConfig.secondaryColor}
                    tertiaryColor={shirtConfig.tertiaryColor}
                    quartiaryColor={shirtConfig.quartiaryColor}
                    textColor={shirtConfig.textColor}
                    textBorderColor={shirtConfig.textBorderColor}
                    shirtText={shirtConfig.shirtText}
                    shirtNumber={shirtConfig.shirtNumber}
                />)
                break;
            case 'SJAAL': 
                svgReactElement = ( <ShirtSvgSjaal
                    primaryColor={shirtConfig.primaryColor}
                    secondaryColor={shirtConfig.secondaryColor}
                    tertiaryColor={shirtConfig.tertiaryColor}
                    quartiaryColor={shirtConfig.quartiaryColor}
                    textColor={shirtConfig.textColor}
                    textBorderColor={shirtConfig.textBorderColor}
                    shirtText={shirtConfig.shirtText}
                    shirtNumber={shirtConfig.shirtNumber}
                />)
                break; 
            case 'BADGE':
                svgReactElement = ( <ShirtSvgBadge
                    primaryColor={shirtConfig.primaryColor}
                    secondaryColor={shirtConfig.secondaryColor}
                    tertiaryColor={shirtConfig.tertiaryColor}
                    quartiaryColor={shirtConfig.quartiaryColor}
                    textColor={shirtConfig.textColor}
                    textBorderColor={shirtConfig.textBorderColor}
                    shirtText={shirtConfig.shirtText}
                    shirtNumber={shirtConfig.shirtNumber}
                />)
        }

        return renderToString(svgReactElement);
    }

    async function setCsvData(parsedCsv) {
        let imageArray = [];
        await Promise.all(parsedCsv.data.map(async (shirtConfig, index) => {
            if (
                shirtConfig.shirtText &&
                shirtConfig.shirtNumber &&
                shirtConfig.primaryColor &&
                shirtConfig.secondaryColor &&
                shirtConfig.tertiaryColor &&
                shirtConfig.quartiaryColor &&
                shirtConfig.textColor &&
                shirtConfig.textBorderColor
            ) {
                let svgElement = handleCompleteShirtChange(shirtConfig);
                let imageData = await downloadSvg(svgElement, {shouldDownload: false});
                imageArray.push({name: shirtConfig.shirtText, image: imageData});
            }
        }));
        downloadZip(imageArray);
    }


    function b64toBlob(dataURI) {

        var byteString = atob(dataURI.split(',')[1]);
        var ab = new ArrayBuffer(byteString.length);
        var ia = new Uint8Array(ab);

        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], { type: 'image/jpeg' });
    }

    async function downloadZip(images){
        const zip = new JSZip();

        for (let i = 0; i < images.length; i++) {
            const blob = b64toBlob(images[i].image);
            zip.file(`ultras-cult-${images[i].name}.png`, blob)
        }

        const zipData = await zip.generateAsync({
            type: "blob",
            streamFiles: true,
        });

        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(zipData);
        link.download = `ultras-cult-${Date.now()}`;
        link.click();
        setLoading(false);
    }

    function handleCsvImport() {
        setLoading(true);
        Papa.parse(importedCsv, {
            header: true,
            complete: setCsvData
        });
    }

    function copyToClipboard() {
        const stringToCopy = `${shirtText} \t ${shirtNumber} \t ${primaryColor} \t ${secondaryColor} \t ${tertiaryColor} \t ${quartiaryColor} \t ${textColor} \t ${textBorderColor}`;
        navigator.clipboard.writeText(stringToCopy);
    }

    async function downloadMultipleSvgDirectly() {
        let imageArray = [];
        let localShirtConfig = {
            primaryColor: primaryColor,
            secondaryColor: secondaryColor,
            tertiaryColor: tertiaryColor,
            quartiaryColor: quartiaryColor,
            textColor: textColor,
            textBorderColor: textBorderColor,
            shirtText: shirtText,
            shirtNumber: shirtNumber
        }

       for await (const design of SHIRT_DESIGNS) {
          let svgElement = handleCompleteShirtChange(localShirtConfig, design);
          let imageData = await downloadSvg(svgElement, {shouldDownload: false});
          imageArray.push({name: `${localShirtConfig.shirtText}-${design}`, image: imageData});
        }
        downloadZip(imageArray);
    }

    function downloadSvgDirectly() {
        if (downloadAll) {
            downloadMultipleSvgDirectly();
        } else {
            let svgElement = document.getElementById('svg-download');
            const serializer = new XMLSerializer();
            if (!svgElement) { return; }
            const svgString = serializer.serializeToString(svgElement);
            downloadSvg(svgString, {shouldDownload: true});
        }

    }



    async function downloadSvg(svgString, {shouldDownload}) {
        let canvasElement = document.createElement("canvas"); // Create a Canvas element.
        if (shirtDesign == "MEGAFOON" || shirtDesign == "MEGAFOONV2") {
            canvasElement.width  = 6144;
            canvasElement.height = 4440;
        } else {
            canvasElement.width  = 6144;
            canvasElement.height = 3900;
        }

        let ctx = canvasElement.getContext('2d');
        let canvasexport = await Canvg.fromString(ctx, svgString, {
        });
        canvasexport.start()

        let image = canvasElement.toDataURL("image/png", 1)
        if (shouldDownload) {
            let highResImage = changeDpiDataUrl(image, 300).replace("image/png", "image/octet-stream");  // here is the most important part because if you dont replace you will get a DOM 18 exception.;
            let anchor = document.createElement('a');
            anchor.setAttribute('download', `ultras-cult-${shirtText}-${shirtDesign}.png`);
            anchor.setAttribute('href', highResImage);
            anchor.click();
        } else {
            return changeDpiDataUrl(image, 300);
        }

    }

  return (
    <div className="App">
        <header className="App-header">
            <div>
                <div className="App-logo">
                    {
                        shirtDesign === "PYRO" && (
                            <ShirtSvgPyro
                                primaryColor={primaryColor}
                                secondaryColor={secondaryColor}
                                tertiaryColor={tertiaryColor}
                                quartiaryColor={quartiaryColor}
                                textColor={textColor}
                                textBorderColor={textBorderColor}
                                shirtText={shirtText}
                                shirtNumber={shirtNumber}
                            />
                        )
                    }
                    {
                        shirtDesign === "MEGAFOON" && (
                            <ShirtSvgMegafoon
                                primaryColor={primaryColor}
                                secondaryColor={secondaryColor}
                                tertiaryColor={tertiaryColor}
                                quartiaryColor={quartiaryColor}
                                textColor={textColor}
                                textBorderColor={textBorderColor}
                                shirtText={shirtText}
                                shirtNumber={shirtNumber}
                            />
                        )
                    }
                    {
                        shirtDesign === "MEGAFOONV2" && (
                            <ShirtSvgMegafoonV2
                                primaryColor={primaryColor}
                                secondaryColor={secondaryColor}
                                tertiaryColor={tertiaryColor}
                                quartiaryColor={quartiaryColor}
                                textColor={textColor}
                                textBorderColor={textBorderColor}
                                shirtText={shirtText}
                                shirtNumber={shirtNumber}
                            />
                        )
                    }
                    {
                        shirtDesign === "SJAAL" && (
                            <ShirtSvgSjaal
                                primaryColor={primaryColor}
                                secondaryColor={secondaryColor}
                                tertiaryColor={tertiaryColor}
                                quartiaryColor={quartiaryColor}
                                textColor={textColor}
                                textBorderColor={textBorderColor}
                                shirtText={shirtText}
                                shirtNumber={shirtNumber}
                            />
                        )
                    }
                    {
                        shirtDesign === "BADGE" && (
                            <ShirtSvgBadge
                                primaryColor={primaryColor}
                                secondaryColor={secondaryColor}
                                tertiaryColor={tertiaryColor}
                                quartiaryColor={quartiaryColor}
                                textColor={textColor}
                                textBorderColor={textBorderColor}
                                shirtText={shirtText}
                                shirtNumber={shirtNumber}
                            />
                        )
                    }

                </div>
            </div>
            <div className="shirtForm">
                <Tabs data-bs-theme="dark">
                    <Tab eventKey="single" title="Enkel">
                        <div>

                            <Form.Label>
                                Upload club logo
                            </Form.Label>
                            <FileUploader
                                handleChange={handlePreviewLogoChange}
                                name="file"
                                label="Upload of sleep club logo"
                                types={fileTypes}
                            />
                            {
                                previewLogo && (
                                    <Image src={URL.createObjectURL(previewLogo)} className="previewlogo"/>
                                )
                            }
                            <Form.Label data-bs-theme="dark">
                                Shirt design
                            </Form.Label>
                            <Form.Select 
                                aria-label="Shirt design"
                                data-bs-theme="dark"
                                onChange={handleShirtDesignChange}
                            >
                                <option value="PYRO">Pyro</option>
                                <option value="MEGAFOON">Megafoon</option>
                                <option value="MEGAFOONV2">Megafoon - V2</option>
                                <option value="SJAAL">Sjaal</option>
                                <option value="BADGE">Badge</option>
                            </Form.Select>
                            <Form.Label
                                data-bs-theme="dark"
                            >
                                Kleurenpalette
                            </Form.Label>
                            <Form.Control
                                type="color"
                                id="primaryColor"
                                value={primaryColor}
                                onChange={handlePrimaryColorChange}
                                data-bs-theme="dark"
                            />
                            <Form.Control
                                type="color"
                                id="secondaryColor"
                                value={secondaryColor}
                                onChange={handleSecondaryColorChange}
                                data-bs-theme="dark"
                            />
                            <Form.Control
                                type="color"
                                id="tertiaryColor"
                                value={tertiaryColor}
                                onChange={handleTertiaryColorChange}
                                data-bs-theme="dark"
                            />

                            <Form.Control
                                type="color"
                                id="quartiaryColor"
                                value={quartiaryColor}
                                onChange={handleQuartiaryColorChange}
                                data-bs-theme="dark"
                            />
                            <Form.Label
                                data-bs-theme="dark"
                            >
                                Tekstkleuren
                            </Form.Label>
                            <Form.Control
                                type="color"
                                id="textColor"
                                value={textColor}
                                onChange={handleTextColorChange}
                                data-bs-theme="dark"
                            />

                            <Form.Control
                                type="color"
                                id="textBorderColor"
                                value={textBorderColor}
                                onChange={handleTextBorderColorChange}
                                data-bs-theme="dark"
                            />


                        </div>
                        <div>
                            <Form.Label
                                htmlFor="stadNaam"
                                data-bs-theme="dark"
                            >
                                Stad- of clubnaam
                            </Form.Label>
                            <Form.Control
                                type="text"
                                id="stadNaam"
                                value={shirtText}
                                onChange={handleShirtTextChange}
                                data-bs-theme="dark"
                            />
                        </div>

                        <div>
                            <Form.Label
                                htmlFor="clubGetal"
                                data-bs-theme="dark"
                            >
                                Kerngetal of jaartal

                            </Form.Label>
                            <Form.Control
                                type="text"
                                id="clubGetal"
                                value={shirtNumber}
                                onChange={handleSetShirtNumber}
                                data-bs-theme="dark"
                            />
                        </div>

                        <div>
                        <Form.Check // prettier-ignore
                            type="switch"
                            data-bs-theme="dark"
                            id="download-all-switch"
                            label="Alle designs downloaden"
                            value={downloadAll}
                            checked={downloadAll}
                            onChange={handleDownloadAllChange}

                          />
                            <Button
                                onClick={downloadSvgDirectly}
                                variant="outline-success"
                            >
                                Download
                            </Button>
                            <Button
                                variant="outline-primary"
                                onClick={copyToClipboard}
                            >
                                Kopieer
                            </Button>

                        </div>
                    </Tab>
                    <Tab eventKey="batch" title="Batch">
                        <Form.Group controlId="formFile" className="mb-3">
                            <Form.Label>Batch shirts bestand uploaden</Form.Label>
                            <Form.Control
                                data-bs-theme="dark"
                                type="file"
                                onChange={handleImportedCsvChange}
                            />
                        </Form.Group>
                        {
                            loading && (
                                <Spinner animation="border" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </Spinner>
                            )
                        }
                        <Button
                            variant="outline-primary"
                            onClick={handleCsvImport}
                        >
                            Start conversie
                        </Button>
                    </Tab>
                </Tabs>

            </div>
        </header>
    </div>
  );
}

export default App;
