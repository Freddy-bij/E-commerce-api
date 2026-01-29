import express, { type Request, type Response } from "express"
import swaggerJSDoc from "swagger-jsdoc"
import swaggerUi from "swagger-ui-express"
// @ts-ignore
import swaggerModelValidator from "swagger-model-validator";


const router = express.Router();
const options: swaggerJSDoc.Options = {
  definition: { // Use 'definition' instead of 'swaggerDefinition' for OpenAPI 3
    openapi: "3.0.0",
    info: {
      title: "API Documentation",
      version: "1.0.0",
      description: "API documentation using swagger-jsdoc",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Local server",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: { // Renamed from 'Bearer' to 'BearerAuth' to match your routers
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT authorization for api",
        },
      },
    },
  },
  apis: ["./src/router/*.ts"],
};

const swaggerSpec = swaggerJSDoc(options);
// IMPORTANT: Comment this out temporarily to see if it's the cause of the crash
// swaggerModelValidator(swaggerSpec);
// swaggerModelValidator(swaggerSpec);
// require("swagger-model-validator")(swaggerSpec)

router.get("/json", (req: Request, res: Response) => {
    res.setHeader("Content-Type", "application/json")
    res.send(swaggerSpec)
})

router.use("/", swaggerUi.serve, swaggerUi.setup(swaggerSpec))

export default router;