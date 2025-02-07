const kv = await Deno.openKv();


async function getRandomUser(nik: string) {
    const cached = await kv.get(["nik", nik]);
    if (cached && cached.value) {
        return cached.value
    }

    const response = await fetch('https://randomuser.me/api/');
    const json = (await response.json()).results[0];

    await kv.set(["nik", nik], json, { expireIn: 60 * 60 * 24 });
    return json
}

async function handler(req: Request) {
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

        const person = (await getRandomUser(nik));
        return new Response(JSON.stringify({
            nik: nik,
            name: person.name.first + " " + person.name.last,
            gender: person.gender,
            date_of_birth: person.dob.date,
        }), { status: 200, headers: { "Content-Type": "application/json" } });
    } catch (err) {
        console.error(err);
        return new Response("invalid request", { status: 400 });
    }
};


Deno.serve(handler);