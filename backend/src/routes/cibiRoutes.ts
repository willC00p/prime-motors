import { Router } from "express";
import { authenticateToken } from "../lib/auth";
import * as cibiController from "../controllers/cibiController";

const router = Router();

// Middleware to check if user is investigator
const isInvestigator = (req: any, res: any, next: any) => {
  if (req.userRole !== "investigator" && req.userRole !== "gm" && req.userRole !== "ceo") {
    return res.status(403).json({ error: "Unauthorized: Investigator role required" });
  }
  next();
};

// Application routes (Leads tracking)
router.post("/applications", authenticateToken, cibiController.createApplication);
router.get("/applications", authenticateToken, cibiController.getAllApplications);
router.get("/applications/:id", authenticateToken, cibiController.getApplication);
router.patch("/applications/:application_id/status", authenticateToken, isInvestigator, cibiController.updateApplicationStatus);

// CI/BI Application routes
router.post("/", authenticateToken, isInvestigator, cibiController.createCIBIApplication);
router.get("/", authenticateToken, cibiController.getAllCIBIApplications);
router.get("/:id", authenticateToken, cibiController.getCIBIApplication);
router.patch("/:id", authenticateToken, isInvestigator, cibiController.updateCIBIApplication);
router.delete("/:id", authenticateToken, isInvestigator, cibiController.deleteCIBIApplication);

// Attachment routes
router.post("/:cibi_application_id/attachments", authenticateToken, cibiController.addAttachment);
router.delete("/attachments/:attachment_id", authenticateToken, isInvestigator, cibiController.removeAttachment);

export default router;
