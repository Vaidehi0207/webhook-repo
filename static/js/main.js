document.addEventListener('DOMContentLoaded', function() {
    const eventsLog = document.getElementById('events-log');

    // Function to format the timestamp into a readable string
    function formatTimestamp(isoString) {
        const date = new Date(isoString);
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
        try {
            const response = await fetch('/events');
            if (!response.ok) {
                throw new Error(HTTP error! status: ${response.status});
            }
            const events = await response.json();

            // Clear the log before rendering new events
            eventsLog.innerHTML = ''; 

            if (events.length === 0) {
                eventsLog.innerHTML = '<p class="loading">No repository events found.</p>';
                return;
            }

            // Create and append an element for each event
            events.forEach(event => {
                const eventElement = document.createElement('div');
                eventElement.className = 'event';
                let message = '';
                const formattedTimestamp = formatTimestamp(event.timestamp);

                // Format the message based on the action type
                switch (event.action) {
                    case 'PUSH':
                        message = <strong>${event.author}</strong> pushed to <strong>${event.to_branch}</strong> on ${formattedTimestamp};
                        break;
                    case 'PULL_REQUEST':
                        message = <strong>${event.author}</strong> submitted a pull request from <strong>${event.from_branch}</strong> to <strong>${event.to_branch}</strong> on ${formattedTimestamp};
                        break;
                    case 'MERGE':
                        message = <strong>${event.author}</strong> merged branch <strong>${event.from_branch}</strong> to <strong>${event.to_branch}</strong> on ${formattedTimestamp};
                        break;
                    default:
                        message = 'An unknown event occurred.';
                }
                eventElement.innerHTML = message;
                eventsLog.appendChild(eventElement);
            });
        } catch (error) {
            console.error("Failed to fetch events:", error);
            eventsLog.innerHTML = '<p class="loading">Error loading events. Please check the console.</p>';
        }
        // hello
    }

    // Fetch events immediately on page load
    fetchEvents();

    // Set an interval to poll for new events every 15 seconds
    setInterval(fetchEvents, 15000);
});