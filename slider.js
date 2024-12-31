const potiSlider = document.getElementById('potiSlider');

        potiSlider.addEventListener('input', function() {
            const potiValue = parseInt(potiSlider.value);
            const left = "1"; // Simulated left value
            const right = "1"; // Simulated right value

            // Create a simulated serialLine input
            const simulatedSerialLine = `${potiValue}-${left}-${right}`;

            // Call the receiveSerial function with the simulated input
            receiveSerial(simulatedSerialLine);
        });