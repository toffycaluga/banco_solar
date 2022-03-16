import pg from "pg";

const pool = new pg.Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'bancosolar',
    password: '1234',
    max: 20,
    min: 2,
    idleTimeoutMillis: 5000,
    connectionTimeoutMillis: 2000
})

export async function leerUsuario() {
    const client = await pool.connect()
    try {
        const { rows } = await client.query({
            text: 'select * from usuarios',
            name: 'select-de-los-usuarios'
        })
        client.release();
        return rows;
    } catch (err) {
        manejoError(err);
        client.release();
    }
}
export async function insertarUsuario(nombre, balance) {
    const client = await pool.connect();
    if (balance >= 0) {
        try {
            const { row } = await client.query({
                text: `insert into usuarios(nombre,balance) values ($1,$2) returning *`,
                values: [nombre, balance],
                name: 'insert-de-los-usuarios'
            });
            console.log(` ${nombre} agregado con exito!`);
            client.release();
        } catch (err) {
            manejoError(err);
            client.release();
        }
    } else {
        client.release;
        return 'balance debe ser mayor a 0'
    }


}
export async function editarUsuarios(id, nombre, balance) {
    const client = await pool.connect();
    if (balance >= 0) {
        try {
            const { row } = await client.query({
                text: `update usuarios set nombre=$2, balance=$3 where id=$1 returning *`,
                values: [id, nombre, balance],
                name: 'update-de-los-usuarios'
            });
            console.log(` ${nombre} editado con exito!`);
            client.release();
            return true;
        } catch (err) {
            manejoError(err);
            client.release();
        }
    } else {
        client.release();
        return 'balance debe ser  mayor que 0'
    }

}
async function eliminarTransferencia(id) {
    const client = await pool.connect();
    try {
        const { rows } = await client.query({
            text: `delete from transferencias where receptor=$1 or emisor=$1;`,
            values: [id],
            name: 'delete-por-id'
        })
        client.release();
    } catch (err) {
        manejoError(err);
        client.release();
    }

}
export async function eliminarUsuario(id) {
    const client = await pool.connect();
    try {
        await eliminarTransferencia(id);
        const { row } = await client.query({
            text: `
            delete from usuarios where id=$1 returning *;`,
            values: [id],
            name: 'delete-por-id'
        })
        console.log(`eliminado con exito`);
        client.release();
    } catch (err) {
        manejoError(err);
        client.release();
    }

}

export async function nuevaTransferencia(emisor, receptor, Monto) {
    const client = await pool.connect();
    const datosEmisor = await buscarId(emisor);
    const datosReceptor = await buscarId(receptor);
    const monto = parseInt(Monto)
    if (datosEmisor[0].id != datosReceptor[0].id) {
        if (monto >= 0) {
            if (monto < datosEmisor[0].balance) {
                try {
                    const { rows } = await client.query({
                        text: `insert into transferencias (fecha,emisor,receptor,monto) values (now(),$1,$2,$3)`,
                        values: [datosEmisor[0].id, datosReceptor[0].id, monto],
                        name: 'insert-de-las-tranferencias'
                    })
                    await updateBalance(datosEmisor[0].id, datosEmisor[0].balance, (-monto));
                    await updateBalance(datosReceptor[0].id, datosReceptor[0].balance, (monto));
                    client.release()
                    return true
                } catch (err) {
                    console.log(err);
                    client.release();
                }
            } else {
                client.release()
                return 'monto excede la cantidad permitida';
            }
        } else {
            client.release();
            return 'valor debe ser mayor que 0'
        }
    } else {
        client.release();
        return 'no puede realizar transferencia entre la misma'
    }
}

async function buscarId(nombre) {
    const client = await pool.connect();
    try {
        const { rows } = await client.query({
            text: 'select id,balance from usuarios where nombre=$1',
            values: [nombre],
            name: 'select-del-id'
        })
        client.release();
        return rows;
    } catch (err) {
        console.log(err);
        client.release();
    }
}


async function updateBalance(id, balance, monto) {
    const client = await pool.connect();
    try {
        const newBalance = balance + monto;
        const { rows } = await client.query({
            text: `update usuarios set balance=$2 where id=$1`,
            values: [id, newBalance],
            name: 'update-usuarios'
        })
        client.release();
    } catch (err) {
        console.log(err);
        client.release();
    }
}
export async function getTransferencias() {
    const client = await pool.connect();
    try {

        const { rows } = await client.query({
            text: `select transferencias.fecha, usuarios.nombre as emisor, u.nombre as receptor, transferencias.monto FROM transferencias JOIN usuarios ON transferencias.emisor=usuarios.id JOIN usuarios as u ON transferencias.receptor=u.id;`,
            rowMode: 'array',
            name: 'select-transferencias-con-join'
        });
        client.release()
        return rows;
    } catch (err) {
        console.log(err);
        client.release()
    }
}