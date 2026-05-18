from fastapi import APIRouter, Request, Query
import httpx 
import json
from fastapi.responses import JSONResponse
import requests

router = APIRouter()

COMMON_BASE = "https://gmap-common-apis.qualcomm.com"
GMAP_BASE = "https://gmap-ui-services.qualcomm.com"
UI_BASE = "https://gmap-ui-services.qualcomm.com"


@router.get("/api/cores")
async def get_cores(request: Request):
    async with httpx.AsyncClient(
    timeout=30,
    verify=False
) as client:
     res = await client.get(
        f"{COMMON_BASE}/api/gmap_cores/get_cores_programs_list",
        headers=request.headers,

    )
    if res.status_code != 200:
     return {
        "error": "Failed to fetch chips",
        "status_code": res.status_code,
    }

    try:
     return res.json()
    except Exception:
     return {
        "error": "Non-JSON response from GMAP", 
    }


@router.get("/chips")
async def get_chips(request: Request, core: str = Query(...)):
    if not core:
        return JSONResponse(content={"chips": []})

    headers = {
        "Accept": "application/json",
        "Accept-Encoding": "gzip, deflate",
    }

    auth = request.headers.get("authorization")
    
    thisObj = {'token': "ZHByZW1rdW0="}

    url_value = f"{GMAP_BASE}/gmap-services/v1/chips_phases_list"
    print(url_value)

    chips_phases_data = requests.get(url=url_value,verify=False,headers=thisObj)
    api_response = chips_phases_data.json()
    

    try:
       return api_response
        # data = resp.json()
    except Exception as e:
        return JSONResponse(
            status_code=502,
            content={
                "error": "Failed to parse GMAP JSON response",
                "details": str(e)
            }
        )

    return JSONResponse(status_code=200, content=data)


@router.post("/dragon-gate")
async def get_dragon_gate(request: Request, payload: dict):

    thisObj = {
        "token": "dmFtcmFkaGk=",
        "Accept": "application/json",
        "Accept-Encoding": "gzip, deflate"
    }

    url_value = f"{GMAP_BASE}/gmap-services/v1/get_dragongate_core_data"
    print("DG URL:", url_value)

    dg_response = requests.post(
        url=url_value,
        json=payload,     
        headers=thisObj,
        verify=False
    )

    print("DG STATUS:", dg_response.status_code)
    print("DG STATUS:", dg_response)

    if dg_response.status_code != 200:
        return {
            "data": {
                "dragon_gate": {
                    "headers": [],
                    "rowsdata": []
                }
            },
            "status": dg_response.status_code,
            "error": "GMAP Dragon Gate failed",
            "raw_preview": dg_response.text[:500]
        }

    dg_json = dg_response.json()
    return dg_json


@router.post("/dv-dflow")
async def get_dv_dflow(request: Request, payload: dict):

    thisObj = {
        "token": "dmFtcmFkaGk=",
        "Accept": "application/json",
        "Accept-Encoding": "gzip, deflate"
    }

    url_value = f"{GMAP_BASE}/gmap-services/v1/get_dvuflow_core_data"
    print("DV DFLOW URL:", url_value)

    dv_response = requests.post(
        url=url_value,
        json=payload,
        headers=thisObj,
        verify=False
    )

    print("DV DFLOW STATUS:", dv_response.status_code)

    if dv_response.status_code != 200:
        return {
            "data": {
                "dv_uflow": {
                    "headers": [],
                    "rowsdata": []
                }
            },
            "status": dv_response.status_code,
            "error": "GMAP DV Dflow failed",
        }

    return dv_response.json()


@router.post("/qvd-summary")
async def get_qvd_summary(request: Request, payload: dict):

    thisObj = {
        "token": "dmFtcmFkaGk=",
        "Accept": "application/json",
        "Accept-Encoding": "gzip, deflate"
    }

    url_value = f"{GMAP_BASE}/gmap-services/v1/get_qvd_core_data"
    print("QVD URL:", url_value)
    print("QVD PAYLOAD:", payload)

    qvd_response = requests.post(
        url=url_value,
        json=payload,
        headers=thisObj,
        verify=False
    )


    print("QVD GMAP STATUS:", qvd_response.status_code)
    print("QVD GMAP TEXT:", qvd_response.text[:1000])

    print("QVD STATUS:", qvd_response.status_code)

    if qvd_response.status_code != 200:
        return {
            "data": {
                "qvd_summary": {
                    "headers": [],
                    "rowsdata": []
                }
            },
            "status": qvd_response.status_code,
            "error": "GMAP QVD Summary failed",
        }

    return qvd_response.json()
