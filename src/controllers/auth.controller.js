import asyncHandler from "../utils/asyncHandler.js";
import authService from "../services/auth.service.js";
import ApiError from "../utils/apiError.js";

export const register = asyncHandler(async (req, res) => {
    const result = await authService.register(req.body);

    res.status(201).json({
        status: "success",
        message: "User registered successfully",
        data: result
    });
})

export const login = asyncHandler(async (req, res) => {

    const result = await authService.login(req.body);
    res.status(200).json({
        status: "success",
        data: result
    })
})

export const refresh = asyncHandler(async (req, res) => {

    const { refreshToken } = req.body;
    if (!refreshToken) {
        throw new ApiError(401, "Refresh Token  Not found!")
    }
    const result = await authService.refresh(refreshToken)

    res.status(200).json({
        success: true,
        message: "Access token refreshed successfully",
        data: result,
    });
})

export const getMe=asyncHandler(async(req,res)=>{
    console.log(req.body,"req.body");
    res.status(200).json({
        success: true,
        message: "Got ity",
        // data: result,
    });
    
})

export const logout = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        throw new ApiError(401, "Refresh token is required");
    }

    const result = await authService.logout(refreshToken);

    res.status(200).json({
        success: true,
        message: result.message,
    });
});

export default { register, login,refresh ,getMe,logout };