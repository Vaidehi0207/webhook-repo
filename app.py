import os
from flask import Flask, request, jsonify, render_template
from pymongo import MongoClient, DESCENDING
from dotenv import load_dotenv
from dateutil import parser 

load_dotenv()

app = Flask(__name__)

MONGO_URI = os.getenv('MONGO_URI')
if not MONGO_URI:
    raise ValueError("No MONGO_URI found in environment variables")

client = MongoClient(MONGO_URI)
db = client.github_events_db
collection = db.events

def standardize_timestamp(ts_string):
    """Parses any valid date string and converts it to ISO 8601 format in UTC."""
    if not ts_string:
        return None
    dt_object = parser.parse(ts_string)
    return dt_object.strftime('%Y-%m-%dT%H:%M:%SZ')


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
        ref = payload.get('ref', '').split('/')[-1]
        commit = payload.get('head_commit')
        if commit:
            event_data = {
                'request_id': commit.get('id'),
                'author': commit.get('author', {}).get('name'),
                'action': 'PUSH',
                'to_branch': ref,
                'from_branch': None,
                'timestamp': standardize_timestamp(commit.get('timestamp'))
            }

    elif event_type == 'pull_request':
        pr = payload.get('pull_request', {})
        action = payload.get('action')

        if action == 'opened':
            event_data = {
                'request_id': str(pr.get('id')),
                'author': pr.get('user', {}).get('login'),
                'action': 'PULL_REQUEST',
                'from_branch': pr.get('head', {}).get('ref'),
                'to_branch': pr.get('base', {}).get('ref'),
                'timestamp': standardize_timestamp(pr.get('created_at'))
            }
        elif action == 'closed' and pr.get('merged'):
            event_data = {
                'request_id': pr.get('merge_commit_sha'),
                'author': pr.get('merged_by', {}).get('login'),
                'action': 'MERGE',
                'from_branch': pr.get('head', {}).get('ref'),
                'to_branch': pr.get('base', {}).get('ref'),
                'timestamp': standardize_timestamp(pr.get('merged_at'))
            }

    if event_data:
        collection.insert_one(event_data)
        return jsonify({'status': 'success', 'message': 'Event processed'}), 200
    
    return jsonify({'status': 'ignored', 'message': 'Event not relevant'}), 200


@app.route('/events', methods=['GET'])
def get_events():
    """Provides event data to the UI."""
    events_cursor = collection.find({}).sort('timestamp', DESCENDING).limit(20)
    events_list = []
    for event in events_cursor:
        event['_id'] = str(event['_id'])
        events_list.append(event)
    return jsonify(events_list)



if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)