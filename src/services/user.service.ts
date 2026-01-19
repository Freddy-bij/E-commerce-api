import { User } from "../model/user.model.js"

export const getUsersService = async () => {
    const users = await User.find({});
    return users
}