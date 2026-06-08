from fastapi import FastAPI, UploadFile, File, Form, Body
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from io import BytesIO
import re
from fastapi.responses import FileResponse
from reportlab.platypus import SimpleDocTemplate,Image as PDFImage, Table
import tempfile
from PIL import Image, ImageDraw, ImageFont


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

TYPES_40 = ["40FT", "40GP", "40HC"]
TYPES_20 = ["20FT", "20GP"]


def display_value(value):
    return "-" if value == 0 else int(value)


def process_excel(file_bytes, received_date, exit_date):

    df = pd.read_excel(BytesIO(file_bytes))

    df = df.iloc[1:].copy()
    df.columns = df.columns.str.strip()

    for col in [
        "File Type",
        "Container Type",
        "Consignee Name",
        "Loading Type",
    ]:
        if col in df.columns:
            df[col] = (
                df[col]
                .fillna("")
                .astype(str)
                .str.upper()
                .str.strip()
            )

    df["Container Type"] = (
        df["Container Type"]
        .str.replace(" ", "", regex=False)
    )

    df = df.drop_duplicates(subset=["File No"])

    df["File Received Date"] = pd.to_datetime(
        df["File Received Date"],
        errors="coerce"
    )

    df["Exit Date"] = pd.to_datetime(
        df["Exit Date"],
        errors="coerce"
    )

    df["Loading Date"] = pd.to_datetime(
        df["Loading Date"],
        errors="coerce"
    )

    def full_filter(d):
        return d[
            d["File Type"].str.contains("COFFEE", na=False)
            |
            d["File Type"].str.contains("FULL CONTAINER", na=False)
        ]

    def empty_filter(d):
        return d[
            d["File Type"].str.startswith("EMPTY", na=False)
        ]

    def get_counts(d):

        full = full_filter(d)
        empty = empty_filter(d)

        return {
            "full_40": full[
                full["Container Type"].isin(TYPES_40)
            ].shape[0],

            "full_20": full[
                full["Container Type"].isin(TYPES_20)
            ].shape[0],

            "empty_40": empty[
                empty["Container Type"].isin(TYPES_40)
            ].shape[0],

            "empty_20": empty[
                empty["Container Type"].isin(TYPES_20)
            ].shape[0],
        }

    # YARD STOCK

    ground_df = df[
        (df["Loading Date"].isna())
        &
        (
            df["Container Status"]
            .fillna("")
            .astype(str)
            .str.upper()
            .str.strip()
            .eq("OFFLOADED")
        )
    ]

    ground_df = ground_df[
        ground_df["Consignee Name"] != "TEST DATABASE"
    ]

    g = get_counts(ground_df)

    # OFFLOADED

    off_df = df[df["File Received Date"].notna()]

    off_df = off_df[
        off_df["File Received Date"]
        .dt.strftime("%Y-%m-%d")
        .eq(received_date)
    ]

    o = get_counts(off_df)

    # EXITED

    ex_df = df[df["Exit Date"].notna()]

    ex_df = ex_df[
        (
            ex_df["Exit Date"]
            .dt.strftime("%Y-%m-%d")
            .eq(exit_date)
        )
        &
        (
            ex_df["Container Status"]
            .fillna("")
            .astype(str)
            .str.upper()
            .str.strip()
            .eq("EXITED")
        )
    ]

    e = get_counts(ex_df)

    # WEIGHBRIDGE

    wb = off_df[
        off_df["File Type"]
        .str.contains("WEIGHBRIDGE", na=False)
    ].shape[0]

    # SHIFTING

    sh = off_df[
        off_df["File Type"].str.contains("SHIFT", na=False)
        |
        off_df["File Type"].str.contains("TRANSHIP", na=False)
    ]

    s40 = sh[
        sh["Container Type"].isin(TYPES_40)
    ]

    s20 = sh[
        sh["Container Type"].isin(TYPES_20)
    ]

    s40e = s40[
        s40["Loading Type"].str.startswith("EMPTY", na=False)
    ].shape[0]

    s40f = s40[
        s40["Loading Type"].str.startswith("FCL", na=False)
    ].shape[0]

    s20e = s20[
        s20["Loading Type"].str.startswith("EMPTY", na=False)
    ].shape[0]

    s20f = s20[
        s20["Loading Type"].str.startswith("FCL", na=False)
    ].shape[0]

    # TRUCK SIGHTING

    si = off_df[
        off_df["File Type"]
        .str.contains("CONTAINER SIGHTING NBD", na=False)
    ]

    si40 = si[
        si["Container Type"].isin([
            "40FT",
            "40GP",
            "40HC",
            "BOXBODY40FT",
            "BOXBODY40GP"
        ])
    ].shape[0]

    si20 = si[
        si["Container Type"].isin([
            "20FT",
            "20GP",
            "BOXBODY20FT",
            "BOXBODY20GP"
        ])
    ].shape[0]

    return {

        # EMPTY

        "offloaded_empty_total": display_value(o["empty_40"] + o["empty_20"]),
        "offloaded_empty_40": display_value(o["empty_40"]),
        "offloaded_empty_20": display_value(o["empty_20"]),

        "exited_empty_total": display_value(e["empty_40"] + e["empty_20"]),
        "exited_empty_40": display_value(e["empty_40"]),
        "exited_empty_20": display_value(e["empty_20"]),

        # FCL

        "offloaded_fcl_total": display_value(o["full_40"] + o["full_20"]),
        "offloaded_fcl_40": display_value(o["full_40"]),
        "offloaded_fcl_20": display_value(o["full_20"]),

        "exited_fcl_total": display_value(e["full_40"] + e["full_20"]),
        "exited_fcl_40": display_value(e["full_40"]),
        "exited_fcl_20": display_value(e["full_20"]),

        # WEIGHBRIDGE

        "weighbridge_total": display_value(wb),

        # SHIFTING EMPTY

        "shifting_empty_total": display_value(s40e + s20e),
        "shifting_empty_40": display_value(s40e),
        "shifting_empty_20": display_value(s20e),

        # SHIFTING FCL

        "shifting_fcl_total": display_value(s40f + s20f),
        "shifting_fcl_40": display_value(s40f),
        "shifting_fcl_20": display_value(s20f),

        # TRUCK SIGHTING

        "sighting_total": display_value(si40 + si20),
        "sighting_40": display_value(si40),
        "sighting_20": display_value(si20),

        # YARD STOCK

        "yard_empty_total": display_value(g["empty_40"] + g["empty_20"]),
        "yard_empty_40": display_value(g["empty_40"]),
        "yard_empty_20": display_value(g["empty_20"]),

        "yard_fcl_total": display_value(g["full_40"] + g["full_20"]),
        "yard_fcl_40": display_value(g["full_40"]),
        "yard_fcl_20": display_value(g["full_20"]),
    }


@app.post("/dashboard-report")
async def dashboard_report(
    file: UploadFile = File(...),
    received_date: str = Form(...),
    exit_date: str = Form(...)
):
    contents = await file.read()

    return process_excel(
        contents,
        received_date,
        exit_date
    )


@app.post("/exit-report")
async def exit_report(
    file: UploadFile = File(...),
    exit_date: str = Form(...)
):

    contents = await file.read()

    df = pd.read_excel(BytesIO(contents))

    if "FILE" in str(df.iloc[0]["File No"]).upper():
        df = df.iloc[1:].copy()

    df.columns = df.columns.str.strip()

    df = df.drop_duplicates(subset=["File No"])

    for col in ["File Type", "Consignee Name"]:
        df[col] = (
            df[col]
            .fillna("")
            .astype(str)
            .str.upper()
            .str.strip()
        )

    df = df[
        df["Consignee Name"] != "TEST DATABASE"
    ]

    df["Exit Date"] = pd.to_datetime(
        df["Exit Date"],
        errors="coerce"
    )

    df = df[
        df["Exit Date"]
        .dt.strftime("%Y-%m-%d")
        .eq(exit_date)
    ]

    allowed = [
        "EMPTY CONTAINER",
        "EMPTY CONTAINER - TRANSIT",
        "EMPTY CONTAINER - TRANSIT NBD",
        "EMPTY CONTAINER NBD"
    ]

    result_df = df[
        df["File Type"].isin(allowed)
    ]

    return {
        "count": len(result_df),
        "rows": result_df[
            [
                "Container No",
                "Consignee Name",
                "Truck No"
            ]
        ].fillna("").to_dict("records")
    }


from pydantic import BaseModel

class GmailRequest(BaseModel):
    truck_number: str

@app.post("/gmail-query")
async def gmail_query(data: GmailRequest):

    keyword = data.truck_number

    clean = re.sub(
        r"[\s\-_]",
        "",
        keyword.upper().strip()
    )

    if not clean:
        return {"query": ""}

    prefix = ""

    for ch in clean:
        if ch.isalpha():
            prefix += ch
        else:
            break

    suffix = clean[len(prefix):]

    variations = {
        clean,
        f"{prefix} {suffix}",
        f"{prefix}-{suffix}",
        f"{prefix}_{suffix}",
    }

    query = " OR ".join(
        f'"{v}"'
        for v in sorted(variations)
    )

    return {"query": query}



def build_report_rows(report):
    return [
        ["Total Empties Offloaded", report["offloaded_empty_total"], report["offloaded_empty_40"], report["offloaded_empty_20"]],
        ["Total Empties Loaded", report["exited_empty_total"], report["exited_empty_40"], report["exited_empty_20"]],
        ["Total FCL Offloaded", report["offloaded_fcl_total"], report["offloaded_fcl_40"], report["offloaded_fcl_20"]],
        ["Total FCL Loaded", report["exited_fcl_total"], report["exited_fcl_40"], report["exited_fcl_20"]],
        ["Total Empty Shifting", report["shifting_empty_total"], report["shifting_empty_40"], report["shifting_empty_20"]],
        ["Total FCL Shifting", report["shifting_fcl_total"], report["shifting_fcl_40"], report["shifting_fcl_20"]],
        ["Truck Sighting", report["sighting_total"], report["sighting_40"], report["sighting_20"]],
        ["Total Weighbridge", report["weighbridge_total"], "-", "-"],
        ["Total Empties In Yard", report["yard_empty_total"], report["yard_empty_40"], report["yard_empty_20"]],
        ["Total FCL In Yard", report["yard_fcl_total"], report["yard_fcl_40"], report["yard_fcl_20"]],
    ] 

@app.post("/export-image")
async def export_image(
    file: UploadFile = File(...),
    received_date: str = Form(...),
    exit_date: str = Form(...)
):
    contents = await file.read()

    report = process_excel(
        contents,
        received_date,
        exit_date
    )

    rows = build_report_rows(report)

    width = 1400
    height = 900

    img = Image.new(
        "RGB",
        (width, height),
        "#001C3D"
    )

    draw = ImageDraw.Draw(img)

    try:
        title_font = ImageFont.truetype("courbd.ttf", 28)
        header_font = ImageFont.truetype("courbd.ttf", 22)
        row_font = ImageFont.truetype("cour.ttf", 20)
    except:
        title_font = ImageFont.load_default()
        header_font = ImageFont.load_default()
        row_font = ImageFont.load_default()

    draw.text(
        (450, 20),
        "NON BONDED YARD REPORT",
        fill="#00FFFF",
        font=title_font
    )

    start_y = 90

    cols = [760, 220, 195, 195]

    headers = [
        "Description",
        "Total",
        "40FT",
        "20FT"
    ]

    x = 20

    for i, h in enumerate(headers):
        draw.rectangle(
            [x, start_y, x + cols[i], start_y + 70],
            fill="#001632",
            outline="#004C99",
            width=1
        )

        draw.text(
            (x + 20, start_y + 22),
            h,
            fill="#00FFFF",
            font=header_font
        )

        x += cols[i]

    y = start_y + 70

    for row in rows:

        x = 20

        for col_index, value in enumerate(row):

            draw.rectangle(
                [x, y, x + cols[col_index], y + 70],
                fill="#001C3D",
                outline="#004C99",
                width=1
            )

            draw.text(
                (x + 20, y + 22),
                str(value),
                fill="white",
                font=row_font
            )

            x += cols[col_index]

        y += 70

    png_path = tempfile.mktemp(".png")

    img.save(
        png_path,
        "PNG"
    )

    return FileResponse(
        png_path,
        filename="yard_report.png",
        media_type="image/png"
    )


@app.post("/export-pdf")
async def export_pdf(
    file: UploadFile = File(...),
    received_date: str = Form(...),
    exit_date: str = Form(...)
):
    contents = await file.read()

    report = process_excel(
        contents,
        received_date,
        exit_date
    )

    rows = build_report_rows(report)

    width = 1400
    height = 900

    img = Image.new(
        "RGB",
        (width, height),
        "#001C3D"
    )

    draw = ImageDraw.Draw(img)

    try:
        title_font = ImageFont.truetype("courbd.ttf", 28)
        header_font = ImageFont.truetype("courbd.ttf", 22)
        row_font = ImageFont.truetype("cour.ttf", 20)
    except:
        title_font = ImageFont.load_default()
        header_font = ImageFont.load_default()
        row_font = ImageFont.load_default()

    draw.text(
        (450, 20),
        "NON BONDED YARD REPORT",
        fill="#00FFFF",
        font=title_font
    )

    start_y = 90

    cols = [760, 220, 195, 195]

    headers = [
        "Description",
        "Total",
        "40FT",
        "20FT"
    ]

    x = 20

    for i, h in enumerate(headers):
        draw.rectangle(
            [x, start_y, x + cols[i], start_y + 70],
            fill="#001632",
            outline="#004C99"
        )

        draw.text(
            (x + 20, start_y + 22),
            h,
            fill="#00FFFF",
            font=header_font
        )

        x += cols[i]

    y = start_y + 70

    for row in rows:

        x = 20

        for col_index, value in enumerate(row):

            draw.rectangle(
                [x, y, x + cols[col_index], y + 70],
                fill="#001C3D",
                outline="#004C99"
            )

            draw.text(
                (x + 20, y + 22),
                str(value),
                fill="white",
                font=row_font
            )

            x += cols[col_index]

        y += 70

    png_path = tempfile.mktemp(".png")
    pdf_path = tempfile.mktemp(".pdf")

    img.save(png_path)

    doc = SimpleDocTemplate(pdf_path)

    doc.build([
        PDFImage(
            png_path,
            width=520,
            height=330
        )
    ])

    return FileResponse(
        pdf_path,
        filename="yard_report.pdf",
        media_type="application/pdf"
    )






# Run:
# uvicorn main:app --reload