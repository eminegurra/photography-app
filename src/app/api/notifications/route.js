export async function GET(req, res) {
  try {
    const notifications = [
      { message: "A new image was uploaded!", timestamp: Date.now() },
    ];

    return new Response(JSON.stringify(notifications), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Error fetching notifications" }), { status: 500 });
  }
}
