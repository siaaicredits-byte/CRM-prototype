
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/prisma/db";
import { getCurrentUser } from "@/lib/auth/authenticate";

const validChannels = ["email", "whatsapp"] as const;
const validTones = ["professional", "friendly", "formal"] as const;

export async function POST(request: NextRequest) {
  try {
    // Authenticate the current user
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Authentication required." },
        { status: 401 }
      );
    }

    // Read and validate request body
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, message: "Invalid request body." },
        { status: 400 }
      );
    }

    const leadId = body.leadId;

    const channel = validChannels.includes(body.channel)
      ? body.channel
      : "email";

    const tone = validTones.includes(body.tone)
      ? body.tone
      : "professional";

    if (
      leadId === undefined ||
      leadId === null ||
      String(leadId).trim() === ""
    ) {
      return NextResponse.json(
        { success: false, message: "Lead ID is required." },
        { status: 400 }
      );
    }

    // Fetch only leads belonging to the authenticated user
    const leads = await db.orm.public.Lead
      .where({ userId: user.id })
      .all();

    const lead = leads.find(
      (item) => String(item.id) === String(leadId)
    );

    if (!lead) {
      return NextResponse.json(
        { success: false, message: "Lead not found." },
        { status: 404 }
      );
    }

    // Prepare lead information
    const name = [lead.firstName, lead.lastName]
      .filter(Boolean)
      .join(" ");

    const firstName = lead.firstName || "there";

    // Generate greeting based on selected tone
    const greeting =
      tone === "friendly"
        ? `Hi ${firstName}!`
        : tone === "formal"
          ? `Dear ${name || "Sir/Madam"},`
          : `Hello ${firstName},`;

    // Generate closing based on selected tone
    const closing =
      tone === "friendly"
        ? "Looking forward to hearing from you!"
        : tone === "formal"
          ? "We look forward to your response."
          : "Looking forward to your response.";

    const subject = "Following up on our conversation";

    let message: string;

    // Generate WhatsApp message
    if (channel === "whatsapp") {
      message = `${greeting}

I hope you're doing well.

I'm following up regarding your interest in our services. I would be happy to understand your requirements and help you with the next steps.

Please let me know a convenient time to connect.

${closing}

Best regards,
${user.name || "Your Sales Team"}`;
    } else {
      // Generate email message
      message = `${greeting}

I hope this email finds you well.

I'm reaching out to follow up regarding your interest in our services. We would appreciate the opportunity to understand your requirements and discuss how we can assist you.

Please let me know a convenient time for a brief discussion.

${closing}

Best regards,
${user.name || "Your Sales Team"}`;
    }

    return NextResponse.json({
      success: true,
      agent: "Follow-Up Writer",
      lead: {
        id: String(lead.id),
        name,
        email: lead.email,
        phone: lead.phone,
        status: lead.status,
      },
      draft: {
        channel,
        tone,
        subject: channel === "email" ? subject : null,
        message,
      },
      method: "Template-based generation",
      message: "Follow-up draft generated successfully.",
    });
  } catch (error) {
    console.error("Follow-Up Writer failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to generate follow-up draft.",
      },
      { status: 500 }
    );
  }
}
