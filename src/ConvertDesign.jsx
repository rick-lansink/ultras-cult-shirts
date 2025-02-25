import './ConvertDesign.css'
import { useState, useEffect, useRef } from "react"
import Form from 'react-bootstrap/Form';
import {FileUploader} from "react-drag-drop-files";
import Image from 'react-bootstrap/Image';
import JSZip from "jszip";
import { Rnd } from 'react-rnd';
import Button from 'react-bootstrap/Button';
import {ProgressBar, Spinner, Tab, Tabs} from "react-bootstrap";
import {changeDpiDataUrl} from "changedpi";

const fileTypes = ["JPG", "PNG", "GIF"];
const fileTypeZip = ["ZIP"];

export default function ConvertDesign() {
    
    const [previewProduct, setPreviewProduct] = useState('');
    const [designZip, setDesignZip] = useState('');
    const [firstFile, setFirstFile] = useState('');
    const [overlayPosition, setOverlayPosition] = useState({ x: 50, y: 50 });
    const [orgOverlayPosition, setOrgOverlayPosition] = useState({ x: 50, y: 50 });
    const [overlaySize, setOverlaySize] = useState({ width: 200, height: 200 });
    const [orgOverlaySize, setOrgOverlaySize] = useState({ width: 200, height: 200 });
    const [resizeFactor, setResizeFactor] = useState(1);
    const [overlayAspectRatio, setOverlayAspectRatio] = useState(1);
    const [bgDimensions, setBgDimensions] = useState({ width: 800, height: 600 });
    const [orgBgDimensions, setOrgBgDimensions] = useState({ width: 800, height: 600 });
    const [firstLoad, setFirstLoad] = useState(false);
    const [firstBgLoad, setFirstBgLoad] = useState(false);
    const [productName, setProductName] = useState('mockup');
    const [loading, setLoading] = useState(false);

    const bgRef = useRef(null);
    const ovRef = useRef(null);
    const canvasRef = useRef(null);
    
    function handlePreviewProductChange(file) {
        setFirstBgLoad(true);
        setPreviewProduct(file);
    }

    function handleProductNameChange(event) {
        setProductName(event.target.value);
    }

    const handleBgLoad = (e) => {
        if (firstBgLoad) {
            const { width, naturalWidth, height, naturalHeight } = e.target;
            //console.log(naturalWidth, naturalHeight)
            setBgDimensions({ width: width, height: height });
            setOrgBgDimensions({width: naturalWidth, height: naturalHeight});
            let xresize =  naturalWidth / width;
    
            setResizeFactor(xresize);
            setFirstBgLoad(false);
        }
        
      };

    const handleDesignZipChange = async (file) => {
        try {
            setFirstLoad(true)
            const zip = new JSZip();
            const zipContent = await zip.loadAsync(file);
      
            const files = Object.keys(zipContent.files);
            
            if (files.length === 0) {
              console.log('The ZIP file is empty.');
              return;
            }
            setDesignZip(zipContent.files);
            const firstFileName = files[0];
            const firstFile = zipContent.files[firstFileName];
      
            const content = await firstFile.async('blob');
            
            
            setFirstFile(content);
        } catch (err) {
            console.log('Error reading zip file', err)
        }
    }

    const setAspectRatio = () => {
        if (ovRef.current && ovRef.current.naturalWidth && firstLoad) {
            const { width, naturalWidth, height, naturalHeight } = ovRef.current;
            const aspectRatio = naturalWidth / naturalHeight;
            setOverlayAspectRatio(aspectRatio);
    
             // Auto scale overlay to 30% of background width
             const overlayWidth = bgDimensions.width * 0.3;
             const overlayHeight = overlayWidth / aspectRatio;
             setOverlaySize({ width: overlayWidth, height: overlayHeight });
             setOrgOverlaySize({width: naturalWidth, height: naturalHeight});
             setFirstLoad(false);
        }
    }

    const loadImage = async (src) => {
        return new Promise((resolve, reject) => {
          const img = new window.Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = src;
        });
      };

    const generateImage = async (background, design) => {
        let canvasElement = document.createElement("canvas"); // Create a Canvas element.
        canvasElement.width = orgBgDimensions.width;
        canvasElement.height = orgBgDimensions.height;
        const ctx = canvasElement.getContext('2d');

        let orgX = overlayPosition.x * resizeFactor;
        let orgY = overlayPosition.y * resizeFactor;
        let orgWidth = overlaySize.width * resizeFactor;
        let orgHeight = overlaySize.height * resizeFactor;
        const previewProductImg = await loadImage(URL.createObjectURL(background));
        const firstFileImg = await loadImage(URL.createObjectURL(design))
        ctx.drawImage(previewProductImg, 0, 0, orgBgDimensions.width, orgBgDimensions.height);
        ctx.drawImage(
            firstFileImg,
            orgX,
            orgY,
            orgWidth,
            orgHeight
        );

        let image = canvasElement.toDataURL("image/png", 1);
        return changeDpiDataUrl(image, 300)
    }

    async function downloadZip(images){
        const zip = new JSZip();

        for (let i = 0; i < images.length; i++) {
            const blob = b64toBlob(images[i].image);
            zip.file(`${images[i].name}.png`, blob)
        }

        const zipData = await zip.generateAsync({
            type: "blob",
            streamFiles: true,
        });

        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(zipData);
        link.download = `${productName}-${Date.now()}`;
        link.click();
        setLoading(false);
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

    const downloadConvertedFiles = async () => {
        if (!previewProduct || !firstFile) return;
        setLoading(true)
        const files = Object.keys(designZip);
        let generatedImages = [];
        for await (const file of files) {
            console.log(file);
            let fileBlob = designZip[file];
            
            const fileContent = await fileBlob.async('blob');
            let genImg = await generateImage(previewProduct, fileContent);
            generatedImages.push({name: `${productName}-${file}`, image: genImg})
        }
        
        downloadZip(generatedImages);
    }

    const setCombinedOverlayPosition = (x, y) => {
        setOverlayPosition({x: x, y: y});
    }

    const setCombinedOverlaySize = ({width, height}) => {
        setOverlaySize({width: width, height: height});
        
    }


    return (
        <div className="design-container">
            <div class="preview">
            {
                previewProduct && (
                    <Image 
                        src={URL.createObjectURL(previewProduct)}  
                        ref={bgRef} 
                        className="previewProduct"
                        onLoad={handleBgLoad}
                    />
                )
            }
            {
                firstFile && (
                    <Rnd
                        bounds="parent"
                        size={overlaySize}
                        position={overlayPosition}
                        onDragStop={(e, d) => setOverlayPosition({ x: d.x, y: d.y })}
                        lockAspectRatio={overlayAspectRatio} 
                        onResizeStop={(e, direction, ref, delta, position) => {
                            setCombinedOverlaySize({
                            width: parseInt(ref.style.width),
                            height: parseInt(ref.style.height),
                            });
                            setOverlayPosition(position);
                        }}
                        >
                        <img
                            src={URL.createObjectURL(firstFile)}
                            onLoad={setAspectRatio}
                            ref={ovRef}
                            alt="Overlay"
                            style={{
                            width: '100%',
                            height: '100%',
                            border: '2px dashed #ccc',
                            borderRadius: '0.5rem',
                            cursor: 'move',
                            }}
                        />
                    </Rnd>
                )
            }
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>
            <div class="convert-form">
                <Form.Label>
                    Upload product
                </Form.Label>
                <FileUploader
                    handleChange={handlePreviewProductChange}
                    name="file"
                    label="Upload of sleep product/mockup"
                    types={fileTypes}
                />

                <Form.Label>
                    Upload ZIP met designs
                </Form.Label>
                <FileUploader
                    handleChange={handleDesignZipChange}
                    name="file"
                    label="Upload een zip met designs"
                    types={fileTypeZip}
                />
                <div>
                    <Form.Label
                        htmlFor="productName"
                        data-bs-theme="dark"
                    >
                        Productnaam
                    </Form.Label>
                    <Form.Control
                        type="text"
                        id="productName"
                        value={productName}
                        onChange={handleProductNameChange}
                        data-bs-theme="dark"
                    />
                </div>
                <Button
                    onClick={downloadConvertedFiles}
                    variant="outline-success"
                >
                    Download
                </Button>
                {
                    loading && (
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </Spinner>
                    )
                }

            </div>
        </div>
    )
}