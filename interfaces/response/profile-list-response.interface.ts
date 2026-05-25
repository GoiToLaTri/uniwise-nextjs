import { ListResponse } from "./list-response.interface";
import { ProfileResponse } from "./profile-response.interface";

export interface ProfileListResponse extends ListResponse{
    content: ProfileResponse[];
}