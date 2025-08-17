import { Request, Response } from 'express';
import { UserService } from '../services/UserService';
export declare class UserController {
    private userService;
    constructor(userService: UserService);
    createUser(req: Request, res: Response): Promise<void>;
    getUserById(req: Request, res: Response): Promise<void>;
    getUsers(req: Request, res: Response): Promise<void>;
    updateUser(req: Request, res: Response): Promise<void>;
    deleteUser(req: Request, res: Response): Promise<void>;
    getCurrentUser(req: Request, res: Response): Promise<void>;
    updateCurrentUser(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=UserController.d.ts.map