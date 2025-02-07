


function handler(req: Request) {
    const url = new URL(req.url);

    if (req.method !== "GET") {
        return new Response(null, {
            status: 405
        })
    }

    const paths = url.pathname.split("/");
    if (paths.length < 3 || paths[1] != "nik") {
        return new Response(null, {
            status: 404
        })
    }
    const nik = paths[2];
    if (nik.length != 16) {
        return new Response(JSON.stringify({
            message: "Invalid NIK"
        }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    try {
        const last = parseInt(nik[nik.length - 1]) % 2;
        if (last != 0) {
            return new Response(JSON.stringify({
                message: "NIK not found"
            }), { status: 404, headers: { "Content-Type": "application/json" } });
        }

        return new Response(JSON.stringify({
            nik: nik,
            name: "person-" + nik,
            gender: "male",
            date_of_birth: "1995-01-01",
        }), { status: 200, headers: { "Content-Type": "application/json" } });
    } catch (err) {
        console.error(err);
        return new Response("invalid request", { status: 400 });
    }
};


Deno.serve(handler);
console.log("Server running on http://localhost:8000/");