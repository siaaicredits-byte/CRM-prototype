
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/authenticate";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Authentication required." },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));

    const meetingTitle =
      typeof body.meetingTitle === "string"
        ? body.meetingTitle.trim()
        : "";

    const meetingDate =
      typeof body.meetingDate === "string"
        ? body.meetingDate.trim()
        : "";

    const attendees =
      typeof body.attendees === "string"
        ? body.attendees.trim()
        : "";

    const notes =
      typeof body.notes === "string"
        ? body.notes.trim()
        : "";

    if (!meetingTitle) {
      return NextResponse.json(
        { success: false, message: "Meeting title is required." },
        { status: 400 }
      );
    }

    if (meetingTitle.length > 200 || notes.length > 10000) {
      return NextResponse.json(
        { success: false, message: "Meeting details exceed the allowed length." },
        { status: 400 }
      );
    }

    const agenda = [
      "Welcome and introductions",
      "Understand the customer's requirements",
      "Discuss proposed solutions and expectations",
      "Address questions and concerns",
      "Agree on next steps and responsibilities",
    ];

    const suggestedActions = [
      "Share the meeting summary with attendees.",
      "Record important customer requirements in the CRM.",
      "Assign responsibility for each agreed action.",
      "Schedule the next follow-up if required.",
    ];

    return NextResponse.json({
      success: true,
      agent: "Meeting Assistant",
      meeting: {
        title: meetingTitle,
        date: meetingDate || "Not specified",
        attendees: attendees || "Not specified",
        preparedBy: user.name || "CRM User",
      },
      preparation: {
        agenda,
        notes: notes || "No meeting notes provided.",
        suggestedActions,
      },
      message: "Meeting preparation generated successfully.",
      method: "Template-based meeting preparation",
    });
  } catch (error) {
    console.error("Meeting Assistant failed:", error);

    return NextResponse.json(
      { success: false, message: "Unable to prepare the meeting." },
      { status: 500 }
    );
  }
}
