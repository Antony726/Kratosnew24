const video = document.getElementById('video');
const resultDiv = document.getElementById('result');
let lastScannedCode = null;  // To prevent repeated scans

// Function to start the camera
function startCamera() {
    const constraints = {
        video: {
            facingMode: { exact: "environment" } // Request the back camera
        }
    };

    navigator.mediaDevices.getUserMedia(constraints)
        .then((stream) => {
            video.srcObject = stream;
        })
        .catch((err) => {
            console.error("Error accessing the camera: ", err);
        });
}

// Start the camera when the page loads
startCamera();

// Function to continuously scan QR codes
function scanQRCode() {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    // Set interval to keep capturing frames
    setInterval(() => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, canvas.width, canvas.height);
        
        if (code && code.data !== lastScannedCode) {
            lastScannedCode = code.data;
            const qrData = JSON.parse(code.data);
            checkValidity(qrData);
        }
    }, 500); // Adjust the interval as needed
}

// Button-based manual scan functionality
document.getElementById('scan-button').addEventListener('click', () => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, canvas.width, canvas.height);

    if (code && code.data !== lastScannedCode) {
        lastScannedCode = code.data;
        const qrData = JSON.parse(code.data);
        checkValidity(qrData);
    } else {
        alert("No QR code found. Please try again.");
    }
});

// Async function to check validity of scanned QR code and send data to backend
async function checkValidity(qrData) {
    const participantData = {
        emailID: qrData.teamLeader,
        eventName: qrData.eventName,
        teamName: qrData.teamName,
        teamLeader: qrData.teamLeader,
        teamMembers: qrData.teamMembers,
        status: 'Verified'
    };

    try {
        const response = await fetch('https://kratosnew24.onrender.com/add-participant', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(participantData)
        });

        const result = await response.json();
        if (response.status === 200) {
            displayDetails(qrData);
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error("Error sending data to the server:", error);
        alert("Error connecting to server. Please try again.");
    }
}

// Function to display participant details
function displayDetails(qrData) {
    resultDiv.innerHTML = `
        <h2>Details</h2>
        <p><strong>Event Name:</strong> ${qrData.eventName}</p>
        <p><strong>Team Name:</strong> ${qrData.teamName}</p>
        <p><strong>Team Leader:</strong> ${qrData.teamLeader}</p>
        <p><strong>Team Members:</strong> ${qrData.teamMembers.join(', ')}</p>
    `;
}

// Start continuous auto-scanning when the page loads
scanQRCode();
