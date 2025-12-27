using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Auth.Infrastructure.Migrations.LogisticsDb
{
    /// <inheritdoc />
    public partial class AddProducts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Drivers_Trucks_TruckId1",
                table: "Drivers");

            migrationBuilder.DropIndex(
                name: "IX_Drivers_TruckId1",
                table: "Drivers");

            migrationBuilder.DropColumn(
                name: "Category",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "MinStock",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "TruckId1",
                table: "Drivers");

            migrationBuilder.RenameColumn(
                name: "Stock",
                table: "Products",
                newName: "Quantity");

            migrationBuilder.RenameColumn(
                name: "SKU",
                table: "Products",
                newName: "Code");

            migrationBuilder.AlterColumn<Guid>(
                name: "DepotId",
                table: "Products",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<Guid>(
                name: "Id",
                table: "Products",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.CreateIndex(
                name: "IX_Products_DepotId",
                table: "Products",
                column: "DepotId");

            migrationBuilder.AddForeignKey(
                name: "FK_Products_Depots_DepotId",
                table: "Products",
                column: "DepotId",
                principalTable: "Depots",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Products_Depots_DepotId",
                table: "Products");

            migrationBuilder.DropIndex(
                name: "IX_Products_DepotId",
                table: "Products");

            migrationBuilder.RenameColumn(
                name: "Quantity",
                table: "Products",
                newName: "Stock");

            migrationBuilder.RenameColumn(
                name: "Code",
                table: "Products",
                newName: "SKU");

            migrationBuilder.AlterColumn<string>(
                name: "DepotId",
                table: "Products",
                type: "text",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AlterColumn<string>(
                name: "Id",
                table: "Products",
                type: "text",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AddColumn<string>(
                name: "Category",
                table: "Products",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "MinStock",
                table: "Products",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<Guid>(
                name: "TruckId1",
                table: "Drivers",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Drivers_TruckId1",
                table: "Drivers",
                column: "TruckId1",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Drivers_Trucks_TruckId1",
                table: "Drivers",
                column: "TruckId1",
                principalTable: "Trucks",
                principalColumn: "Id");
        }
    }
}
