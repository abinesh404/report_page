import urllib.request
import json
import traceback

data = json.dumps({'formData': {'reportName': 'Test', 'reportType': 'Executive Summary'}}).encode('utf-8')
req = urllib.request.Request('http://localhost:4004/api/generate-ppt', data=data, headers={'Content-Type': 'application/json'})
try:
    res = urllib.request.urlopen(req)
    print('Status:', res.status)
except Exception as e:
    print('Error:', e)
    if hasattr(e, 'read'):
        print('Body:', e.read().decode('utf-8'))
