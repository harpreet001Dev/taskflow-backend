import memberService from "../services/member.service.js";

const addMember = async (req, res) => {
    const { userId } = req.body;

    const member = await memberService.addMember(
        userId,
        req.user.org_id
    );

    return res.status(201).json({
        success: true,
        message: "Member added successfully",
        data: member,
    });
};

export default {
    addMember,
};