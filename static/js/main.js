// Add this console.log *immediately* at the top of the file
// This will tell us if the script file itself is being loaded and parsed.
console.log("main.js script loaded and beginning execution!");

document.addEventListener('DOMContentLoaded', function() {
    // Add this console.log to confirm DOMContentLoaded event fired
    console.log("DOMContentLoaded event fired. Initializing...");

    const eventsLog = document.getElementById('events-log');

    // Display initial loading message
    eventsLog.innerHTML = '<p class="loading">Loading events...</p>';
    console.log("Initial 'Loading events...' message set.");


    // Function to format the timestamp into a readable string
    function formatTimestamp(isoString) {
        if (!isoString) {
            console.warn("formatTimestamp received null or undefined isoString.");
            return 'N/A';
        }
        const date = new Date(isoString);
        if (isNaN(date.getTime())) {
            console.warn("Invalid timestamp string received by formatTimestamp:", isoString);
            return 'Invalid Date Format';
        }
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'UTC',
            timeZoneName: 'short'
        });
    }

    // Function to fetch and display events
    async function fetchEvents() {
        console.log("fetchEvents() called. Attempting to fetch from /events...");
        try {
            const response = await fetch('/events');
            console.log("Response received from /events:", response);

            if (!response.ok) {
                const errorText = await response.text(); // Get raw error text
                console.error(`HTTP error! Status: ${response.status}. Response text: ${errorText}`);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const events = await response.json();
            console.log("Successfully parsed JSON events:", events);

            // Clear the log before rendering new events
            eventsLog.innerHTML = '';
            console.log("eventsLog cleared. Number of events to display:", events.length);


            if (events.length === 0) {
                eventsLog.innerHTML = '<p class="loading">No repository events found.</p>';
                console.log("No events found. Displaying 'No events' message.");
                return;
            }

            // Create and append an element for each event
            events.forEach((event, index) => {
                console.log(`Processing event ${index}:`, event);
                const eventElement = document.createElement('div');
                eventElement.className = 'event';
                let message = '';
                const formattedTimestamp = formatTimestamp(event.timestamp);

                // Check for existence of crucial properties before using them
                const author = event.author || 'Unknown';
                const toBranch = event.to_branch || 'N/A';
                const fromBranch = event.from_branch || 'N/A'; // Only applicable for PR/MERGE

                switch (event.action) {
                    case 'PUSH':
                        message = `<strong>${author}</strong> pushed to <strong>${toBranch}</strong> on ${formattedTimestamp}`;
                        break;
                    case 'PULL_REQUEST':
                        message = `<strong>${author}</strong> submitted a pull request from <strong>${fromBranch}</strong> to <strong>${toBranch}</strong> on ${formattedTimestamp}`;
                        break;
                    case 'MERGE':
                        message = `<strong>${author}</strong> merged branch <strong>${fromBranch}</strong> to <strong>${toBranch}</strong> on ${formattedTimestamp}`;
                        break;
                    default:
                        message = `An unknown event occurred: Action '${event.action || 'Unknown'}' by <strong>${author}</strong> on ${formattedTimestamp}. Raw data: ${JSON.stringify(event)}`;
                }
                console.log(`Event ${index} message:`, message);
                eventElement.innerHTML = message;
                eventsLog.appendChild(eventElement);
                console.log(`Event ${index} appended to DOM.`);
            });
            console.log("All events processed and appended.");

        } catch (error) {
            console.error("Caught error in fetchEvents:", error); // Log the full error object
            eventsLog.innerHTML = '<p class="error">Error loading events. Please check the console for details.</p>';
        }
    }

    // Fetch events immediately on page load
    fetchEvents();

    // Set an interval to poll for new events every 15 seconds
    setInterval(fetchEvents, 15000);
    console.log("Polling interval set for 15 seconds.");
});

// Add another console.log outside DOMContentLoaded to see if parsing stops early
console.log("End of main.js script file.");