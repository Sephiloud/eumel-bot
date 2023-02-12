import fs from 'fs';
import Keyv from 'keyv';
import DatabaseInformation from './Database.json';

type DatbaseData = {
    [databaseName: string]: {
        keyv: string,
        path: string,
        filename: string
    }
};

export enum DatabaseName {
    Valentine = 'Valentine',
    Wolf = 'Wolf'
}

export async function databaseSetup(path: string, fileName: string, callback?: (success: boolean) => void) {
    if (!fs.existsSync("./database/valentine.sqlite")) {
        if (!fs.existsSync("./database")){
            fs.mkdirSync("./database");
        }
        try {
            await fs.promises.appendFile("./database/valentine.sqlite", new Uint8Array());
            console.log(`${fileName} database is created successfully!`);
            return true;
        } catch (error: any) {
            console.log(`${fileName} database creation failed!\n${error}`);
            return false;
        }
    }
    return true;
}

export async function getKeyvDatabase(database: DatabaseName, namespace?: string) {
    const databaseData = (DatabaseInformation as DatbaseData)[database.toString()];
    const databaseExistsOrCreated = await databaseSetup(databaseData.path, databaseData.filename);
    if (databaseExistsOrCreated) {
        const keyvDatabase = namespace ? new Keyv("sqlite://./database/valentine.sqlite", { namespace })
            : new Keyv("sqlite://./database/valentine.sqlite");
        return keyvDatabase;
    }
    return undefined;
}