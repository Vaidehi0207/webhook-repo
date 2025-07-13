import os
from flask import Flask, request, jsonify, render_template
from pymongo import MongoClient, DESCENDING
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# --- Database Connection ---
# Fetch the MongoDB connection string from environment variables
MONGO_URI = os.getenv('MONGO_URI')
if not MONGO_URI:
    raise ValueError("No MONGO_URI found in environment variables")

client = MongoClient(MONGO_URI)
db = client.github_events_db # Database name
collection = db.events       # Collection name

# --- Routes ---

@app.route('/')
def index():
    """Serves the main HTML page for the UI."""
    return render_template('index.html')


@app.route('/webhook', methods=['POST'])
def github_webhook():
    """Receives webhook events from GitHub."""
    event_type = request.headers.get('X-GitHub-Event')
    payload = request.json

    event_data = None

    if event_type == 'push':
        # Handles Push events
        ref = payload.get('ref', '').split('/')[-1]
        commit = payload.get('head_commit')
        if commit:
            event_data = {
                'request_id': commit.get('id'),
                'author': commit.get('author', {}).get('name'),
                'action': 'PUSH',
                'to_branch': ref,
                'from_branch': None,
                'timestamp': commit.get('timestamp')
            }

    elif event_type == 'pull_request':
        pr = payload.get('pull_request', {})
        action = payload.get('action')

        if action == 'opened':
            # Handles Pull Request creation events
            event_data = {
                'request_id': str(pr.get('id')),
                'author': pr.get('user', {}).get('login'),
                'action': 'PULL_REQUEST',
                'from_branch': pr.get('head', {}).get('ref'),
                'to_branch': pr.get('base', {}).get('ref'),
                'timestamp': pr.get('created_at')
            }
        elif action == 'closed' and pr.get('merged'):
            # Handles Merge events
            event_data = {
                'request_id': pr.get('merge_commit_sha'),
                'author': pr.get('merged_by', {}).get('login'),
                'action': 'MERGE',
                'from_branch': pr.get('head', {}).get('ref'),
                'to_branch': pr.get('base', {}).get('ref'),
                'timestamp': pr.get('merged_at')
            }

    if event_data:
        # Insert the processed data into MongoDB
        collection.insert_one(event_data)
        return jsonify({'status': 'success', 'message': 'Event processed'}), 200
    
    return jsonify({'status': 'ignored', 'message': 'Event not relevant'}), 200


@app.route('/events', methods=['GET'])
def get_events():
    """Provides event data to the UI, which polls every 15 seconds."""
    # Fetch latest 20 events, sorted by timestamp
    events_cursor = collection.find({}).sort('timestamp', DESCENDING).limit(20)
    
    events_list = []
    for event in events_cursor:
        # Convert MongoDB's ObjectId to string for JSON serialization
        event['_id'] = str(event['_id'])
        events_list.append(event)
        
    return jsonify(events_list)


# --- Main Execution ---

if __name__ == '__main__':
    # Use the PORT environment variable if available, otherwise default to 5000
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)