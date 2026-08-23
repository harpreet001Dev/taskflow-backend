import express from 'express';
import authRoute from '../routes/auth.route.js';
import projectRoute from '../routes/project.routes.js'
import taskRoute from '../routes/task.route.js'
import jobRoute from '../routes/job.routes.js'
import memberRoute from '../routes/member.routes.js'
const router = express.Router();

router.use('/auth', authRoute);
router.use('/project', projectRoute);
router.use('/task', taskRoute);
router.use('/job',jobRoute)
router.use('/member',memberRoute)

export default router;