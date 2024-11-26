"use client"
import React, { useEffect, useRef, useState } from 'react';
import Script from 'next/script';

export default function TeachableMachineClassifier() {
  const [isLoading, setIsLoading] = useState(true);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [predictions, setPredictions] = useState([]);
  const webcamContainerRef = useRef(null);
  const modelRef = useRef(null);
  const webcamRef = useRef(null);
  const maxPredictionsRef = useRef(0);
  const animationFrameRef = useRef(null);

  // Teachable Machine model URL
  const URL = "https://teachablemachine.withgoogle.com/models/I8WL0_Y_7/";

  const stopWebcam = () => {
    // Cancel animation frame
    if (animationFrameRef.current) {
      window.cancelAnimationFrame(animationFrameRef.current);
    }

    // Stop webcam if it's active
    if (webcamRef.current) {
      webcamRef.current.stop();
      
      // Remove webcam stream tracks to fully release camera
      const stream = webcamRef.current.webcam.srcObject;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    }

    // Reset refs and state
    setIsModelLoaded(false);
    modelRef.current = null;
    webcamRef.current = null;
  };

  const initTeachableMachine = async () => {
    // Ensure external libraries are loaded
    if (!window.tmImage || !window.tf) {
      console.error('Teachable Machine libraries not loaded');
      return;
    }

    try {
      const modelURL = URL + "model.json";
      const metadataURL = URL + "metadata.json";

      // Load the model
      modelRef.current = await window.tmImage.load(modelURL, metadataURL);
      maxPredictionsRef.current = modelRef.current.getTotalClasses();

      // Setup webcam
      const flip = true;
      webcamRef.current = new window.tmImage.Webcam(200, 200, flip);
      await webcamRef.current.setup();
      await webcamRef.current.play();

      // Append webcam canvas to container
      if (webcamContainerRef.current) {
        webcamContainerRef.current.innerHTML = ''; // Clear previous content
        webcamContainerRef.current.appendChild(webcamRef.current.canvas);
      }

      setIsModelLoaded(true);
      animationFrameRef.current = window.requestAnimationFrame(loop);
    } catch (error) {
      console.error('Error initializing Teachable Machine:', error);
    }
  };

  const loop = async () => {
    if (webcamRef.current) {
      webcamRef.current.update();
      await predict();
      animationFrameRef.current = window.requestAnimationFrame(loop);
    }
  };

  const predict = async () => {
    if (modelRef.current && webcamRef.current) {
      const prediction = await modelRef.current.predict(webcamRef.current.canvas);
      setPredictions(prediction);
    }
  };

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      stopWebcam();
    };
  }, []);

  useEffect(() => {
    // Check if libraries are loaded
    const checkLibrariesLoaded = () => {
      if (window.tmImage && window.tf) {
        setIsLoading(false);
      } else {
        // If not loaded, check again after a short delay
        setTimeout(checkLibrariesLoaded, 100);
      }
    };

    checkLibrariesLoaded();
  }, []);

  return (
    <div className="teachable-machine-container">
      <Script
        src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@latest/dist/tf.min.js"
        strategy="afterInteractive"
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/@teachablemachine/image@latest/dist/teachablemachine-image.min.js"
        strategy="afterInteractive"
      />

      <h1>Teachable Machine Image Model</h1>
      
      {isLoading ? (
        <div>Loading libraries...</div>
      ) : (
        <>
          <button 
            type="button" 
            onClick={initTeachableMachine}
            disabled={isModelLoaded}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            {isModelLoaded ? 'Model Loaded' : 'Start'}
          </button>
          
          {isModelLoaded && (
            <button 
              type="button" 
              onClick={stopWebcam}
              className="bg-red-500 text-white px-4 py-2 rounded ml-2"
            >
              Stop Webcam
            </button>
          )}
          
          <div 
            ref={webcamContainerRef} 
            id="webcam-container" 
            className="mt-4"
          />
          
          <div 
            id="label-container" 
            className="mt-4 space-y-2"
          >
            {predictions.map((prediction, index) => (
              <div key={index}>
                {prediction.className}: {prediction.probability.toFixed(2)}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}