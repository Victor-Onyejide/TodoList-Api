import express, { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { promises as fs } from 'fs'

const app = express();

const PORT = 5000;
const DATABASE = './src/database/database.json'

app.use(express.json())


interface List {
    id: string,
    todo: string
}

type Data = {
    list: List[]
}

async function readList(): Promise<Data> {
    const data = await fs.readFile(DATABASE)
    const parse_data: Data = JSON.parse(data.toString())
    return parse_data
    // return list
}

async function writeList(data: Data) {
    fs.writeFile(DATABASE, JSON.stringify(data))

}

app.get('/list', async (req: Request, res: Response) => {
    try {
        let data = await readList()
        let { list } = data
        res.status(200).json(list)

    } catch (err) {
        res.status(404).json(err)
    }


})

    .post('/list', async (req: Request, res: Response) => {
        const { todo } = req.body
        try {
            let data = await readList()
            let { list } = data

            let item: List = {
                id: uuidv4(),
                todo: todo
            }

            list.push(item)

            await writeList(data)
            res.status(200).json(data)

        }
        catch (err) {
            res.status(404).json(err)
        }

    })

    .patch('/list/:id', async (req: Request, res: Response) => {
        const { id } = req.params
        const { todo } = req.body
        try {
            let data = await readList()
            let { list } = data
            list = list.map((item) => (item.id === id ? { id, todo } : item))

            data.list = list

            await writeList(data)

            res.status(202).json(data)
        }
        catch (err) {
            res.status(404).json(err)
        }

    })
    .delete('/list/:id', async (req: Request, res: Response) => {
        const { id } = req.params;

        try {
            let data = await readList();
            let { list } = data;


            list = list.filter((item) => item.id !== id)

            data.list = list

            await writeList(data)
            res.status(202).json(data)
        } catch (error) {

            res.status(404).json(error)
        }

    })

const start = () => {
    try {
        app.listen(PORT, () => console.log(`Running on port ${PORT}`))
    }
    catch (err) {
        console.log(err)
    }
}

start()