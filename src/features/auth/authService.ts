import { UserRepository } from "./userRepository.ts";

export class AuthService {
    constructor(userRepository: UserRepository) {
        this.userRepository = userRepository;
    }
    private userRepository: UserRepository
    login() {

    }

    register() {

    }

    logout() {

    }

    refresh() {

    }
    me() {

    }
}
