using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace DeniyorumButigi.Api.DTOs
{
    public record OrderItemDto(int ProductId, string ProductName, int Quantity, decimal UnitPrice, string? SelectedSize, string? SelectedColor);
    
    public record OrderDto(
        int Id, 
        string OrderNumber, 
        string CustomerFirstName, 
        string CustomerLastName, 
        decimal TotalAmount, 
        string PaymentStatus, 
        DateTime OrderDate,
        List<OrderItemDto> Items);

    public record CreateOrderItemDto([Required] int ProductId, [Range(1, 100)] int Quantity, string? SelectedSize, string? SelectedColor);

    public record CreateOrderDto(
        [Required] string CustomerFirstName,
        [Required] string CustomerLastName,
        [Required, EmailAddress] string Email,
        [Required] string Phone,
        [Required] string ShippingAddress,
        [Required] List<CreateOrderItemDto> Items);
}
