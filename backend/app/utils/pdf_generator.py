from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import inch
from io import BytesIO
from datetime import datetime

# Translation Dictionary
TRANSLATIONS = {
    "en": {
        "title": "Financial Statement", 
        "period": "Period",
        "property": "Property",
        "owner": "Owner",
        "financial_summary": "FINANCIAL SUMMARY",
        "gross_revenue": "Gross Revenue",
        "total_expenses": "Total Expenses",
        "net_revenue": "Net Revenue",
        "commission": "Management Commission",
        "payout": "Owner Payout",
        "reservations": "Reservations",
        "guest": "Guest",
        "check_in": "Check-in",
        "check_out": "Check-out",
        "gross_amount": "Gross Amount",
        "no_reservations": "No reservations this period.",
        "expenses": "Expenses",
        "date": "Date",
        "category": "Category",
        "description": "Description",
        "amount": "Amount",
        "no_expenses": "No expenses this period.",
        "generated_on": "Generated on",
    },
    "es": {
        "title": "Estado de Cuenta Financiero",
        "period": "Período",
        "property": "Propiedad",
        "owner": "Propietario",
        "financial_summary": "RESUMEN FINANCIERO",
        "gross_revenue": "Ingresos Brutos",
        "total_expenses": "Gastos Totales",
        "net_revenue": "Ingresos Netos",
        "commission": "Comisión de Administración",
        "payout": "Pago al Propietario",
        "reservations": "Reservas",
        "guest": "Huésped",
        "check_in": "Check-in", # Often kept as Check-in, or Entrada
        "check_out": "Check-out", # Often kept as Check-out, or Salida
        "gross_amount": "Monto Bruto",
        "no_reservations": "No hay reservas en este período.",
        "expenses": "Gastos",
        "date": "Fecha",
        "category": "Categoría",
        "description": "Descripción",
        "amount": "Monto",
        "no_expenses": "No hay gastos en este período.",
        "generated_on": "Generado el",
    }
}

def create_owner_statement_pdf(data, lang="es"):
    # Fallback to English if lang not supported, though default is 'es'
    t = TRANSLATIONS.get(lang, TRANSLATIONS["es"])

    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    elements = []
    styles = getSampleStyleSheet()

    # Title
    elements.append(Paragraph(f"{t['title']} - {data['period']}", styles['Title']))
    elements.append(Spacer(1, 12))
    
    # Header Info
    header_data = [
        [f"{t['property']}:", data['property']['name']],
        [f"{t['owner']}:", data['owner']['name']],
        [f"{t['period']}:", f"{data['period_start']} to {data['period_end']}"]
    ]
    header_table = Table(header_data, colWidths=[1.5*inch, 4*inch])
    header_table.setStyle(TableStyle([
        ('FONTNAME', (0,0), (-1,-1), 'Helvetica'),
        ('FONTSIZE', (0,0), (-1,-1), 10),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
    ]))
    elements.append(header_table)
    elements.append(Spacer(1, 24))

    # Financial Summary
    fin = data['financials']
    summary_data = [
        [t['financial_summary'], ""],
        [t['gross_revenue'], f"${fin['gross_revenue']:,.2f}"],
        [t['total_expenses'], f"${fin['total_expenses']:,.2f}"],
        [t['net_revenue'], f"${fin['net_revenue']:,.2f}"],
        [f"{t['commission']} ({fin['commission_rate']*100:.0f}%)", f"${fin['commission']:,.2f}"],
        [t['payout'].upper(), f"${fin['payout']:,.2f}"]
    ]
    
    t_sum = Table(summary_data, colWidths=[4*inch, 2*inch])
    t_sum.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (1,0), colors.grey),
        ('TEXTCOLOR', (0,0), (1,0), colors.whitesmoke),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('ALIGN', (1,0), (1,-1), 'RIGHT'),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTNAME', (0,-1), (-1,-1), 'Helvetica-Bold'), # Payout row bold
        ('LINEABOVE', (0,-1), (-1,-1), 1, colors.black),
        ('BOX', (0,0), (-1,-1), 0.25, colors.black),
        ('INNERGRID', (0,0), (-1,-1), 0.25, colors.black),
    ]))
    elements.append(t_sum)
    elements.append(Spacer(1, 24))

    # Reservations
    elements.append(Paragraph(t['reservations'], styles['Heading2']))
    res_data = [[t['guest'], t['check_in'], t['check_out'], t['gross_amount']]]
    for r in data['reservations']:
        res_data.append([
            r['guest'],
            str(r['check_in']),
            str(r['check_out']),
            f"${r['gross_amount']:,.2f}"
        ])
    
    if len(res_data) > 1:
        t_res = Table(res_data, colWidths=[2*inch, 1.5*inch, 1.5*inch, 1.5*inch])
        t_res.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.lightgrey),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('ALIGN', (-1,0), (-1,-1), 'RIGHT'), # Amount right aligned
            ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
        ]))
        elements.append(t_res)
    else:
        elements.append(Paragraph(t['no_reservations'], styles['Normal']))

    elements.append(Spacer(1, 24))

    # Expenses
    elements.append(Paragraph(t['expenses'], styles['Heading2']))
    exp_data = [[t['date'], t['category'], t['description'], t['amount']]]
    for e in data['expenses']:
        exp_data.append([
            str(e['date']),
            e['category'],
            e['description'],
            f"${e['amount']:,.2f}"
        ])
        
    if len(exp_data) > 1:
        t_exp = Table(exp_data, colWidths=[1.5*inch, 1.5*inch, 2*inch, 1.5*inch])
        t_exp.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.lightgrey),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('ALIGN', (-1,0), (-1,-1), 'RIGHT'),
            ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
        ]))
        elements.append(t_exp)
    else:
        elements.append(Paragraph(t['no_expenses'], styles['Normal']))

    elements.append(Spacer(1, 24))
    
    # Footer
    generated_text = f"{t['generated_on']} {datetime.now().strftime('%Y-%m-%d %H:%M')} by Element Rentals"
    elements.append(Paragraph(generated_text, styles['Normal']))

    doc.build(elements)
    buffer.seek(0)
    return buffer.getvalue()
