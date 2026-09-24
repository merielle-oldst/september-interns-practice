export class Project {
    private readonly _id: string;
    private _name: string;
    private _client: string | undefined;
    private _active: boolean;

  // Rules:
    // - client is optional
    // - duplicate names are not allowed
    // - when updating, a project may keep its current name
    // - archived projects cannot be modified
    // - archived projects cannot be archived again
  
}


