"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.arnPermissions = exports.cfnParamString = exports.OutputVariable = void 0;
const cdk = require("aws-cdk-lib");
function OutputVariable(scope, _id, _value, _description) {
    new cdk.CfnOutput(scope, _id, {
        value: JSON.stringify(_value),
        description: _description,
    });
}
exports.OutputVariable = OutputVariable;
function cfnParamString(scope, id, dataType, description) {
    return new cdk.CfnParameter(scope, id, {
        type: dataType || 'String',
        default: undefined,
        description: description || "A String should be here"
    });
}
exports.cfnParamString = cfnParamString;
class arnPermissions {
    constructor(arns, permissions) {
        this.arns = [];
        this.permissions = [];
        this.arns = arns;
        this.permissions = permissions;
    }
    addArns(arns) {
        arns.forEach(element => {
            this.arns.push(element);
        });
    }
    addPermissions(permissions) {
        permissions.forEach(element => {
            this.permissions.push(element);
        });
    }
}
exports.arnPermissions = arnPermissions;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGVscGVyU2NyaXB0cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImhlbHBlclNjcmlwdHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBQW1DO0FBRW5DLFNBQWdCLGNBQWMsQ0FBQyxLQUFlLEVBQUMsR0FBVSxFQUFDLE1BQW9CLEVBQUMsWUFBbUI7SUFDOUYsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBQyxHQUFHLEVBQUM7UUFDeEIsS0FBSyxFQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDO1FBQzVCLFdBQVcsRUFBQyxZQUFZO0tBQzNCLENBQUMsQ0FBQTtBQUNOLENBQUM7QUFMRCx3Q0FLQztBQUVELFNBQWdCLGNBQWMsQ0FBQyxLQUFlLEVBQUMsRUFBUyxFQUFDLFFBQWdCLEVBQUMsV0FBbUI7SUFDekYsT0FBTyxJQUFJLEdBQUcsQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFDLEVBQUUsRUFBQztRQUNqQyxJQUFJLEVBQUMsUUFBUSxJQUFFLFFBQVE7UUFDdkIsT0FBTyxFQUFDLFNBQVM7UUFDakIsV0FBVyxFQUFDLFdBQVcsSUFBRSx5QkFBeUI7S0FDckQsQ0FBQyxDQUFBO0FBQ04sQ0FBQztBQU5ELHdDQU1DO0FBQ0QsTUFBYSxjQUFjO0lBR3ZCLFlBQVksSUFBYSxFQUFDLFdBQW9CO1FBRjlDLFNBQUksR0FBVSxFQUFFLENBQUM7UUFDakIsZ0JBQVcsR0FBVSxFQUFFLENBQUM7UUFFcEIsSUFBSSxDQUFDLElBQUksR0FBQyxJQUFJLENBQUM7UUFDZixJQUFJLENBQUMsV0FBVyxHQUFDLFdBQVcsQ0FBQztJQUNqQyxDQUFDO0lBQ0QsT0FBTyxDQUFDLElBQWE7UUFDakIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUNuQixJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQTtRQUMzQixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFDRCxjQUFjLENBQUMsV0FBb0I7UUFDL0IsV0FBVyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUMxQixJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQTtRQUNsQyxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSjtBQWpCRCx3Q0FpQkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XG5leHBvcnQgZnVuY3Rpb24gT3V0cHV0VmFyaWFibGUoc2NvcGU6Q29uc3RydWN0LF9pZDpzdHJpbmcsX3ZhbHVlOnN0cmluZ3xvYmplY3QsX2Rlc2NyaXB0aW9uOnN0cmluZyl7XG4gICAgbmV3IGNkay5DZm5PdXRwdXQoc2NvcGUsX2lkLHtcbiAgICAgICAgdmFsdWU6SlNPTi5zdHJpbmdpZnkoX3ZhbHVlKSxcbiAgICAgICAgZGVzY3JpcHRpb246X2Rlc2NyaXB0aW9uLFxuICAgIH0pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjZm5QYXJhbVN0cmluZyhzY29wZTpDb25zdHJ1Y3QsaWQ6c3RyaW5nLGRhdGFUeXBlPzpzdHJpbmcsZGVzY3JpcHRpb24/OnN0cmluZyl7XG4gICAgcmV0dXJuIG5ldyBjZGsuQ2ZuUGFyYW1ldGVyKHNjb3BlLGlkLHtcbiAgICAgICAgdHlwZTpkYXRhVHlwZXx8J1N0cmluZycsXG4gICAgICAgIGRlZmF1bHQ6dW5kZWZpbmVkLFxuICAgICAgICBkZXNjcmlwdGlvbjpkZXNjcmlwdGlvbnx8XCJBIFN0cmluZyBzaG91bGQgYmUgaGVyZVwiXG4gICAgfSlcbn1cbmV4cG9ydCBjbGFzcyBhcm5QZXJtaXNzaW9ucyB7XG4gICAgYXJuczpzdHJpbmdbXT1bXTtcbiAgICBwZXJtaXNzaW9uczpzdHJpbmdbXT1bXTtcbiAgICBjb25zdHJ1Y3Rvcihhcm5zOnN0cmluZ1tdLHBlcm1pc3Npb25zOnN0cmluZ1tdKSB7XG4gICAgICAgIHRoaXMuYXJucz1hcm5zO1xuICAgICAgICB0aGlzLnBlcm1pc3Npb25zPXBlcm1pc3Npb25zO1xuICAgIH1cbiAgICBhZGRBcm5zKGFybnM6c3RyaW5nW10pe1xuICAgICAgICBhcm5zLmZvckVhY2goZWxlbWVudCA9PiB7XG4gICAgICAgICAgICB0aGlzLmFybnMucHVzaChlbGVtZW50KVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgYWRkUGVybWlzc2lvbnMocGVybWlzc2lvbnM6c3RyaW5nW10pe1xuICAgICAgICBwZXJtaXNzaW9ucy5mb3JFYWNoKGVsZW1lbnQgPT4ge1xuICAgICAgICAgICAgdGhpcy5wZXJtaXNzaW9ucy5wdXNoKGVsZW1lbnQpXG4gICAgICAgIH0pO1xuICAgIH1cbn0iXX0=