"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DDBTable = void 0;
const ddb = require("aws-cdk-lib/aws-dynamodb");
class DDBTable extends ddb.Table {
    constructor(scope, id, partitionKey, sortKey, billingMode, removalPolicy) {
        super(scope, id, {
            partitionKey: {
                name: partitionKey,
                type: ddb.AttributeType.STRING
            },
            sortKey: sortKey ? {
                name: sortKey,
                type: ddb.AttributeType.STRING
            } : undefined,
            billingMode: billingMode ? billingMode : undefined,
            removalPolicy: removalPolicy ? removalPolicy : undefined
        });
    }
}
exports.DDBTable = DDBTable;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGRiLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGRiLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLGdEQUFnRDtBQUdoRCxNQUFhLFFBQVMsU0FBUSxHQUFHLENBQUMsS0FBSztJQUNuQyxZQUFZLEtBQWUsRUFBQyxFQUFTLEVBQUMsWUFBbUIsRUFBQyxPQUFlLEVBQUMsV0FBNEIsRUFBQyxhQUFnQztRQUNuSSxLQUFLLENBQUMsS0FBSyxFQUFDLEVBQUUsRUFBQztZQUNYLFlBQVksRUFBQztnQkFDVCxJQUFJLEVBQUMsWUFBWTtnQkFDakIsSUFBSSxFQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsTUFBTTthQUNoQztZQUNELE9BQU8sRUFBQyxPQUFPLENBQUEsQ0FBQyxDQUFBO2dCQUNaLElBQUksRUFBQyxPQUFPO2dCQUNaLElBQUksRUFBQyxHQUFHLENBQUMsYUFBYSxDQUFDLE1BQU07YUFDaEMsQ0FBQSxDQUFDLENBQUEsU0FBUztZQUNYLFdBQVcsRUFBQyxXQUFXLENBQUEsQ0FBQyxDQUFBLFdBQVcsQ0FBQSxDQUFDLENBQUEsU0FBUztZQUM3QyxhQUFhLEVBQUMsYUFBYSxDQUFBLENBQUMsQ0FBQSxhQUFhLENBQUEsQ0FBQyxDQUFBLFNBQVM7U0FDdEQsQ0FBQyxDQUFBO0lBQ04sQ0FBQztDQUNKO0FBZkQsNEJBZUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0ICogYXMgZGRiIGZyb20gJ2F3cy1jZGstbGliL2F3cy1keW5hbW9kYic7XG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tICdjb25zdHJ1Y3RzJztcblxuZXhwb3J0IGNsYXNzIEREQlRhYmxlIGV4dGVuZHMgZGRiLlRhYmxle1xuICAgIGNvbnN0cnVjdG9yKHNjb3BlOkNvbnN0cnVjdCxpZDpzdHJpbmcscGFydGl0aW9uS2V5OnN0cmluZyxzb3J0S2V5PzpzdHJpbmcsYmlsbGluZ01vZGU/OmRkYi5CaWxsaW5nTW9kZSxyZW1vdmFsUG9saWN5PzpjZGsuUmVtb3ZhbFBvbGljeSl7XG4gICAgICAgIHN1cGVyKHNjb3BlLGlkLHtcbiAgICAgICAgICAgIHBhcnRpdGlvbktleTp7XG4gICAgICAgICAgICAgICAgbmFtZTpwYXJ0aXRpb25LZXksXG4gICAgICAgICAgICAgICAgdHlwZTpkZGIuQXR0cmlidXRlVHlwZS5TVFJJTkdcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzb3J0S2V5OnNvcnRLZXk/e1xuICAgICAgICAgICAgICAgIG5hbWU6c29ydEtleSxcbiAgICAgICAgICAgICAgICB0eXBlOmRkYi5BdHRyaWJ1dGVUeXBlLlNUUklOR1xuICAgICAgICAgICAgfTp1bmRlZmluZWQsXG4gICAgICAgICAgICBiaWxsaW5nTW9kZTpiaWxsaW5nTW9kZT9iaWxsaW5nTW9kZTp1bmRlZmluZWQsXG4gICAgICAgICAgICByZW1vdmFsUG9saWN5OnJlbW92YWxQb2xpY3k/cmVtb3ZhbFBvbGljeTp1bmRlZmluZWRcbiAgICAgICAgfSlcbiAgICB9XG59Il19