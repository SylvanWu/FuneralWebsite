// Simple script to test the server connection
import fetch from 'node-fetch';

const API_URL = 'http://localhost:5001';

async function testServerConnection() {
    try {
        console.log('Testing server health endpoint...');
        const healthResponse = await fetch(`${API_URL}/api/health`);

        if (healthResponse.ok) {
            const healthData = await healthResponse.json();
            console.log('Server health status:', healthData);

            console.log('\nTesting funeral rooms endpoint...');
            const roomsResponse = await fetch(`${API_URL}/api/funerals/rooms`);

            if (roomsResponse.ok) {
                const roomsData = await roomsResponse.json();
                console.log('Number of funeral rooms:', roomsData.length);
                console.log('Sample room data:', roomsData[0] || 'No rooms available');
            } else {
                console.error('Failed to fetch funeral rooms:', roomsResponse.status, roomsResponse.statusText);
            }
        } else {
            console.error('Server health check failed:', healthResponse.status, healthResponse.statusText);
        }
    } catch (error) {
        console.error('Error connecting to server:', error.message);
    }
}

testServerConnection();