import express, { type Request, type Response } from "express"
import swaggerJSDoc from "swagger-jsdoc"
import swaggerUi from "swagger-ui-express"
// @ts-ignore
import swaggerModelValidator from "swagger-model-validator";


const router = express.Router();

const options: swaggerJSDoc.Options = {
    swaggerDefinition: {
        openapi:"3.0.0",
        info: {
            title:"API Documentation",
            version:"1.0.0",
            description:"API documention using swagger-jsdoc"
        },
        tags:[
            {
                name:"User",
                description:"User related endpoints"
            },
            {
                name:"Product",
                description:"Product related endpoints"
            },
            {
               name: "Category",
               description: "category related endpoint"
            },
            {
                name: "cart",
                description: "cart related endpoint"
            },
            {
                name:"Server",
                description:"Server related endpoints"
            }
        ],
        servers: [
            {
                url:"http://localhost:3000",
                description:"Local server"
            },
        ],
            components:{
                securitySchemes: {
                    Bearer: {
                        type: "http",
                        scheme: "bearer",
                        bearerFormat: "JWT",
                        description: "JWT authorization for api"
                    },
                    ApiKeyAuth: {
                        type: "apikey",
                        in: "header",   
                            name: "x-api-key",
                            description: "api key authorization for api" 
                        }
                    }
                }
    },
    apis:["./src/router/*.ts"]
}

const swaggerSpec = swaggerJSDoc(options)
swaggerModelValidator(swaggerSpec);
// require("swagger-model-validator")(swaggerSpec)

router.get("/json", (req: Request, res: Response) => {
    res.setHeader("Content-Type", "application/json")
    res.send(swaggerSpec)
})

router.use("/", swaggerUi.serve, swaggerUi.setup(swaggerSpec))

export default router;