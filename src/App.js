import './App.css';
import ShirtSvg from './ShirtSvg'
import { useState, useRef } from 'react';
import Form from 'react-bootstrap/Form';
import { Canvg } from 'canvg';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import {changeDpiDataUrl} from "changedpi";

function App() {
    const [primaryColor, setPrimaryColor] = useState('#ff0000');
    const [secondaryColor, setSecondaryColor] = useState('#ffffff');
    const [tertiaryColor, setTertiaryColor] = useState('#ff00ff');
    const [quartiaryColor, setQuartiaryColor] = useState('#00ff00');
    const [textColor, setTextColor] = useState('#ffffff');
    const [textBorderColor, setTextBorderColor] = useState('#ff0000');
    const [shirtText, setShirtText] = useState('Enschede');
    const [shirtNumber, setShirtNumber] = useState('1965');
    const canvasRef = useRef(null);

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

    async function downloadSvg() {
        let svgElement = document.getElementById('svg-download');
        var serializer = new XMLSerializer();
        var svgString = serializer.serializeToString(svgElement);
        let canvasElement = document.createElement("canvas"); // Create a Canvas element.

        canvasElement.width  = 2048;
        canvasElement.height = 1300;
        let ctx = canvasElement.getContext('2d');
        let canvasexport = await Canvg.fromString(ctx, svgString, {
        });
        canvasexport.start()

        let image = canvasElement.toDataURL("image/png", 1)
        let highResImage = changeDpiDataUrl(image, 300).replace("image/png", "image/octet-stream");  // here is the most important part because if you dont replace you will get a DOM 18 exception.;
        let anchor = document.createElement('a');
        anchor.setAttribute('download', `ultras-cult-${shirtText}.png`);
        anchor.setAttribute('href', highResImage);
        anchor.click();
    }

  return (
    <div className="App">
        <header className="App-header">
            <div>
                <ShirtSvg
                    primaryColor={primaryColor}
                    secondaryColor={secondaryColor}
                    tertiaryColor={tertiaryColor}
                    quartiaryColor={quartiaryColor}
                    textColor={textColor}
                    textBorderColor={textBorderColor}
                    shirtText={shirtText}
                    shirtNumber={shirtNumber}
                />
            </div>
            <div className="shirtForm">
                <div>
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
                    <Button
                        onClick={downloadSvg}
                        variant="success"
                    >
                        Download
                    </Button>
                </div>
            </div>
        </header>
    </div>
  );
}

export default App;
