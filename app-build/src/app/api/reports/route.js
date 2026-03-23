// Community Reports API - starts empty, populated by user submissions only
import { NextResponse } from 'next/server';

// Empty — no fake/hardcoded reports
let reports = [];

export async function GET() {
    return NextResponse.json({
        reports,
        total: reports.length,
        verified: reports.filter(r => r.verified).length,
        highSeverity: reports.filter(r => r.severity === 'HIGH').length,
        timestamp: new Date().toISOString(),
    });
}

export async function POST(request) {
    try {
        const body = await request.json();

        const newReport = {
            id: String(Date.now()),
            reporter: body.reporter || 'Anonymous',
            phone: body.phone || 'N/A',
            location: body.location,
            coordinates: body.coordinates || null,
            description: body.description,
            severity: body.severity || 'MODERATE',
            type: body.type || 'FLOODING',
            verified: false,
            timestamp: new Date().toISOString(),
        };

        reports.unshift(newReport);

        return NextResponse.json({
            success: true,
            report: newReport,
        }, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to submit report', message: error.message },
            { status: 400 }
        );
    }
}
