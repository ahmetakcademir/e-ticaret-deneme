using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DeniyorumButigi.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAppUserIdToOrder : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AppUserId",
                table: "Orders",
                type: "TEXT",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AppUserId",
                table: "Orders");
        }
    }
}
