import { GetItemCommand, DeleteItemCommand, PutItemCommand, ScanCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb'
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb'
import db from '../db'


const getBlog = async (event) => {
    const response = { statusCode: 200, body: {} };

    try {
        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Key: marshall({ blogId: event.pathParameters.blogId }),
        };

        const { Item } = await db.send(new GetItemCommand(params));

        console.log({ Item });

        response.body = JSON.stringify({
            message: "Successfully retrived data",
            data: (Item) ? unmarshall(Item) : {},
            rawData: Item,
        });
    } catch (e) {
        console.error(e);
        response.statusCode = 500;
        response.body = JSON.stringify({
            message: "Failed to get post",
            errorMsg: e.message,
            errorStack: e.stack,
        })
    }

    return response;
}
