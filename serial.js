// Check if Web Serial API is supported
if ("serial" in navigator) {
    // Function to connect to the serial port
    async function connectToSerial() {
        try {
            // Request a port and open a connection
            const port = await navigator.serial.requestPort();
            await port.open({ baudRate: 9600 }); // Match baud rate with your Arduino

            // Setup a text decoder to read incoming data
            const decoder = new TextDecoderStream();
            const inputDone = port.readable.pipeTo(decoder.writable);
            const inputStream = decoder.readable;

            // Create a reader to read the data
            const reader = inputStream.getReader();

            // Buffer for accumulating data until a newline is received
            let lineBuffer = "";

            // Loop to continuously read data
            while (true) {
                const { value, done } = await reader.read();
                if (done) {
                    // Allow the serial port to be closed cleanly
                    console.log("Serial port closed");
                    break;
                }
                // Add received data to the buffer
                lineBuffer += value;

                // Check for newline character (end of line)
                let newlineIndex;
                while ((newlineIndex = lineBuffer.indexOf('\n')) !== -1) {
                    // Extract complete line
                    const completeLine = lineBuffer.slice(0, newlineIndex).trim();
                    receiveSerial(completeLine)

                    // Remove the processed line from the buffer
                    lineBuffer = lineBuffer.slice(newlineIndex + 1);
                }
            }
        } catch (error) {
            console.error("There was an error opening the serial port:", error);
        }
    }

    // Button to initiate connection
    document.getElementById("connectButton").addEventListener("click", connectToSerial);
} else {
    console.log("Web Serial API is not supported in this browser.");
}
