import { Router } from "express";
import { authenticateToken } from "../utils/auth";
import * as cibiController from "../controllers/cibiController";

const router = Router();

// Application routes (Leads tracking)
router.post("/applications", authenticateToken, cibiController.createApplication);
router.get("/applications", authenticateToken, cibiController.getAllApplications);
router.get("/applications/:id", authenticateToken, cibiController.getApplication);
router.patch("/applications/:application_id/status", authenticateToken, cibiController.updateApplicationStatus);

// Models route
router.get("/models", authenticateToken, cibiController.getModels);

// CI/BI Application routes
router.post("/", authenticateToken, cibiController.createCIBIApplication);
router.get("/", authenticateToken, cibiController.getAllCIBIApplications);
router.get("/:id", authenticateToken, cibiController.getCIBIApplication);
router.patch("/:id", authenticateToken, cibiController.updateCIBIApplication);
router.delete("/:id", authenticateToken, cibiController.deleteCIBIApplication);

// Attachment routes
router.post("/:cibi_application_id/attachments", authenticateToken, cibiController.addAttachment);
router.delete("/attachments/:attachment_id", authenticateToken, cibiController.removeAttachment);

export default router;
