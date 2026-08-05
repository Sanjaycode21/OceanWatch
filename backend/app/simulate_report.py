import time
import requests
import io
from datetime import datetime

BACKEND_URL = "http://localhost:8000/api/v1"

def run_simulation():
    print("=== OCEANWATCH CITIZEN REPORT SIMULATION ===")
    
    # 1. Register a mock citizen
    citizen_email = f"citizen_{int(time.time())}@oceanwatch.com"
    print(f"1. Registering citizen profile: {citizen_email}...")
    try:
        reg_res = requests.post(f"{BACKEND_URL}/auth/signup", json={
            "email": citizen_email,
            "phone": f"+1555{int(time.time()) % 1000000:06d}",
            "password": "CitizenPass123!",
            "full_name": "Citizen Sentinel",
            "role": "citizen"
        })
        if reg_res.status_code != 201:
            print(f"Failed to register citizen: {reg_res.text}")
            return
    except Exception as e:
        print(f"Connection to backend failed. Make sure FastAPI server is running on port 8000. Error: {e}")
        return

    # 2. Login to get access token
    print("2. Authenticating citizen session...")
    login_res = requests.post(f"{BACKEND_URL}/auth/login", data={
        "username": citizen_email,
        "password": "CitizenPass123!"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3. Submit a hazard report
    print("3. Submitting citizen report (with simulated oil slick photo)...")
    mock_image = io.BytesIO(b"fake image data")
    files = {
        "image": ("oilslick.png", mock_image, "image/png")
    }
    data = {
        "latitude": 25.08,
        "longitude": -80.18,
        "timestamp": datetime.now().isoformat(),
        "description": "Heavy oil sheen observed coating the coastal waters.",
        "device_id": "simulator-device"
    }
    
    report_res = requests.post(f"{BACKEND_URL}/reports/", data=data, files=files, headers=headers)
    if report_res.status_code == 201:
        report_data = report_res.json()
        print(f"SUCCESS: Report ingested. UUID: {report_data['id']}")
        print("Wait 3 seconds for the AI pipeline to analyze the report...")
        time.sleep(3)
        print("AI Processing Complete. Check your Command Center Dashboard (http://localhost:3000) to view the new marker!")
    else:
        print(f"Ingestion failed: {report_res.text}")

if __name__ == "__main__":
    run_simulation()
