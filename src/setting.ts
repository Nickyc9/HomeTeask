import express, {Request, Response} from 'express';

export const app = express()
app.use(express.json())
type RequestWithParams<P> = Request<P, {}, {}, {}>
type RequestWithBody<B> = Request<{}, {}, B, {}>

enum AvailableResolution {
    P144 = 'P144',
    P240 = 'P144',
    P360 = 'P144',
    P480 = 'P480',
    P720 = 'P480',
    P1080 = 'P480',
    P1440 = 'P1440',
    P2160 = 'P1440',

}

type VideoType = {
    id: number
    title: string
    author: string
    canBeDownloaded: boolean
    minAgeRestriction: number | null
    createdAt: string
    publicationDate: string
    availableResolutions: AvailableResolution[]

}

const videoDb: VideoType[] = [
    {
        id: 0,
        title: "string",
        author: "string",
        canBeDownloaded: true,
        minAgeRestriction: null,
        createdAt: "2023-08-14T16:17:22.082Z",
        publicationDate: "2023-08-14T16:17:22.082Z",
        availableResolutions: [
            AvailableResolution.P144
        ]

    }]

app.get('/videos', (req: Request, res: Response) => {
    res.send(videoDb)

})
app.get('/videos/:id', (req: RequestWithParams<{ id: number }>, res: Response) => {
    const id: number = +req.params.id

    const video = videoDb.find((video: VideoType) => video.id === id)

    if (!video) {
        res.sendStatus(404)
        return
    }
    res.send(video)
})
type ErrorsMessages = {
    message: string
    field: string
}
type ErrorType = {
    errorsMessages: ErrorsMessages[]
}
app.post('/videos', (req: RequestWithBody<{
    title: string,
    author: string,
    availableResolutions: AvailableResolution[]
}>, res: Response) => {
    let errors: ErrorType = {
        errorsMessages: []
    }

    let {title, author, availableResolutions} = req.body
    if (!title || !title.length || author.trim().length > 40) {
        errors.errorsMessages.push({message: 'Invalid title', field: 'author'})
    }
    if (!author || !author.length || author.trim().length > 20) {
        errors.errorsMessages.push({message: 'Invalid author', field: 'author'})
    }
    if (Array.isArray(availableResolutions) && availableResolutions.length) {
        availableResolutions.map((r) => {
            !AvailableResolution[r] && errors.errorsMessages.push({
                message: 'Invalid availableResolutions',
                field: 'availableResolutions'
            })
        })

    } else {
        availableResolutions = []
    }
    if (errors.errorsMessages.length) {
        res.status(400).send(errors)
        return
    }
    const createdAt = new Date()
    const publicationDate = new Date()
    publicationDate.setDate(createdAt.getDate() + 1)

    const newVideo: VideoType = {
        id: +(new Date()),
        canBeDownloaded: false,
        minAgeRestriction: null,
        createdAt: createdAt.toISOString(),
        publicationDate: publicationDate.toISOString(),
        title,
        author,
        availableResolutions
    }
    videoDb.push(newVideo)

    res.status(201).send(newVideo)
})

interface UpdateVideoRequestBody {
    title?: string;
    author?: string;
    availableResolutions?: AvailableResolution[];
    canBeDownloaded?: boolean;
    minAgeRestriction?: number | null;
    publicationDate?: string;
}

app.put('/videos/:id', (req: RequestWithParams<{ id: number }>, res: Response) => {
    const id: number = +req.params.id;

    const videoIndex = videoDb.findIndex((video: VideoType) => video.id === id);

    if (videoIndex === -1) {
        res.status(404).send({ errorsMessages: [{ message: 'Video not found', field: 'id' }] });
        return;
    }

    const {
        title = "",
        author = "",
        availableResolutions = [],
        canBeDownloaded = false,
        minAgeRestriction = null,
        publicationDate = ""
    }: UpdateVideoRequestBody = req.body;

    let errors: ErrorType = {
        errorsMessages: []
    };

    if (!title || !title.length || title.trim().length > 40) {
        errors.errorsMessages.push({ message: 'Invalid title', field: 'title' });
    }
    if (!author || !author.length || author.trim().length > 20) {
        errors.errorsMessages.push({ message: 'Invalid author', field: 'author' });
    }
    if (!Array.isArray(availableResolutions) || availableResolutions.length === 0) {
        errors.errorsMessages.push({ message: 'Invalid availableResolutions', field: 'availableResolutions' });
    } else {
        for (const resolution of availableResolutions) {
            if (!AvailableResolution[resolution]) {
                errors.errorsMessages.push({ message: 'Invalid availableResolutions', field: 'availableResolutions' });
                break;
            }
        }
    }

    if (errors.errorsMessages.length) {
        res.status(400).send(errors);
        return;
    }

    const updatedVideo: VideoType = {
        ...videoDb[videoIndex],
        title,
        author,
        availableResolutions,
        canBeDownloaded,
        minAgeRestriction,
        publicationDate
    };

    videoDb[videoIndex] = updatedVideo;

    res.status(204).send(); // Sending a 204 response with no content
})
app.delete('/videos/:id', (req: RequestWithParams<{ id: number }>, res: Response) => {
    const id: number = +req.params.id;

    const videoIndex = videoDb.findIndex((video: VideoType) => video.id === id);

    if (videoIndex === -1) {
        res.status(404).send({ errorsMessages: [{ message: 'Video not found', field: 'id' }] });
        return;
    }

    videoDb.splice(videoIndex, 1);
    res.status(204).send();
})
app.delete('/clear', (req: Request, res: Response) => {
    videoDb.splice(0, videoDb.length);
    res.status(204).send();
})












