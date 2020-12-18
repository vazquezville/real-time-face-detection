const video = document.getElementById("video");

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("models"),
  faceapi.nets.faceRecognitionNet.loadFromUri("models"),
  faceapi.nets.faceExpressionNet.loadFromUri("models"),
]).then(startVideo);

function startVideo() {
  //Ask permission to browser to get video cam and make it the source of our id video element
  navigator.mediaDevices.getUserMedia({ video: {} }).then(
    (stream) => {
      video.srcObject = stream;
    },
    (err) => console.error(err)
  );
}

//When the video is played, we triggered a listener to confirrm it works
video.addEventListener("playing", () => {

  //Create the canvas to draw the info, over the video element, with the same size
  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);
  const displaySize = { height: video.height, width: video.width };

  faceapi.matchDimensions(canvas, displaySize);

  //Interval to detect faces and faces changes with the library options
  setInterval(async () => {
    
    //Detections from the library: faces, face's marks, face's expressions
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions();

    //Resize detections labels to fit in the video elemente
    const resizedDetections = faceapi.resizeResults(detections, displaySize);

    //Draw detections with the correct size in the canvas element
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    faceapi.draw.drawDetections(canvas, resizedDetections);
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
  }, 1000);
});