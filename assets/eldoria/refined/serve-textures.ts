// Temporary loopback-only server for Studio's authenticated image upload tool.
Bun.serve({
  hostname: "127.0.0.1",
  port: 8767,
  fetch(request) {
    const name = new URL(request.url).pathname.slice(1);
    if (!/^[A-Za-z_]+\.png$/.test(name)) return new Response("Not found", { status: 404 });
    return new Response(Bun.file("assets/eldoria/refined/textures/" + name));
  },
});
console.log("Texture transfer server on http://127.0.0.1:8767");
