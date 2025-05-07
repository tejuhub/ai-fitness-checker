let detector, video, canvas, ctx;

async function setupCamera() {
  video = document.getElementById("webcam");
  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
  });
  video.srcObject = stream;
  await new Promise((resolve) => {
    video.onloadedmetadata = () => resolve(video);
  });
  return video;
}

async function loadModel() {
  return await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet);
}

function drawSkeleton(pose, color = "red") {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  pose.keypoints.forEach((kp) => {
    if (kp.score > 0.4) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI);
      ctx.fill();
    }
  });
}

function isSquatCorrect(pose) {
  const leftHip = pose.keypoints.find((k) => k.name === "left_hip");
  const leftKnee = pose.keypoints.find((k) => k.name === "left_knee");
  return leftKnee.y < leftHip.y;
}

async function run() {
  video = await setupCamera();
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  detector = await loadModel();

  const detect = async () => {
    const poses = await detector.estimatePoses(video);
    if (poses.length > 0) {
      const pose = poses[0];
      const correct = isSquatCorrect(pose);
      drawSkeleton(pose, correct ? "green" : "red");
    }
    requestAnimationFrame(detect);
  };
  detect();
}

run();