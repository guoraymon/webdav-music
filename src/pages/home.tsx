import {List, ListItem} from "../components/List";
import {useEffect, useState} from "react";
import {readDir, BaseDirectory, readBinaryFile} from '@tauri-apps/api/fs';
import {extname} from "path-browserify";
import {Container} from "../components";

interface Music {
    name: string,
}

let audioContext: AudioContext, audioSource: AudioBufferSourceNode;
const Home = () => {
    const [musics, setMusics] = useState<Music[]>([]);

    useEffect(() => {
        audioContext = new window.AudioContext;

        fetchMusics();

        return () => {
            audioContext.close()
        }
    }, []);

    const fetchMusics = () => {
        readDir('Music', {dir: BaseDirectory.Home}).then(res => {
            const musics: Music[] = [];
            for (const entry of res) {
                if (entry.name) {
                    const extName = extname(entry.name);
                    if (['.mp3', '.flac'].indexOf(extName) !== -1) {
                        musics.push({
                            name: entry.name,
                        });
                    }
                }
            }
            setMusics(musics);
        })
    }

    const onClick = (music: Music) => {
        console.log('click')
        console.time('test');
        readBinaryFile(`Music/${music.name}`, {dir: BaseDirectory.Home}).then(async res => {
            console.log('readBinaryFile')
            console.timeEnd('test');
            if (audioSource) {
                audioSource.disconnect();
            }
            audioSource = audioContext.createBufferSource();
            audioSource.connect(audioContext.destination);
            audioSource.buffer = await audioContext.decodeAudioData(res.buffer);
            audioSource.start();
        })
    }

    return (
        <Container>
            <List>
                {
                    musics.map(music =>
                        <ListItem
                            key={music.name}
                            onClick={() => onClick(music)}
                        >
                            {music.name}
                        </ListItem>
                    )
                }
            </List>
        </Container>
    )
}

export default Home;