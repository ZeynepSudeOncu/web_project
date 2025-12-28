using Auth.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Auth.Infrastructure.Logistics.Context;


namespace Auth.Infrastructure.Logistics.Context;

public class LogisticsDbContext : DbContext
{
    public LogisticsDbContext(DbContextOptions<LogisticsDbContext> options)
        : base(options)
    {
    }

    public DbSet<Depot> Depots { get; set; }
public DbSet<Store> Stores { get; set; }
public DbSet<Truck> Trucks { get; set; }
public DbSet<Driver> Drivers { get; set; }
public DbSet<Order> Orders { get; set; }
public DbSet<Product> Products { get; set; }
public DbSet<DepotProduct> DepotProducts { get; set; } // ✅ EKLENDİ
public DbSet<StoreProduct> StoreProduct { get; set; } // (zaten entity var, DbSet de olmalı)
public DbSet<StoreRequest> StoreRequests => Set<StoreRequest>();



    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Driver>(e =>
        {
            e.HasKey(x => x.Id);

            e.Property(x => x.FullName).IsRequired();
            e.Property(x => x.Phone).IsRequired();
            e.Property(x => x.License).IsRequired();
            e.Property(x => x.Status).IsRequired();

            // 1-1: TruckId unique (TruckId null olabilir)
            e.HasIndex(x => x.TruckId)
             .IsUnique();

            e.HasOne(x => x.Truck)
             .WithOne()
             .HasForeignKey<Driver>(x => x.TruckId)
             .OnDelete(DeleteBehavior.SetNull);
        });


        modelBuilder.Entity<StoreProduct>(entity =>
{
    entity.HasKey(x => x.Id);

    entity.HasOne(x => x.Store)
          .WithMany(s => s.StoreProduct)
          .HasForeignKey(x => x.StoreId)
          .OnDelete(DeleteBehavior.Cascade);

    entity.HasOne(x => x.Product)
          .WithMany(p => p.StoreProduct)
          .HasForeignKey(x => x.ProductId)
          .OnDelete(DeleteBehavior.Cascade);

    entity.HasIndex(x => new { x.StoreId, x.ProductId })
          .IsUnique();

    entity.Property(x => x.Quantity)
          .IsRequired();
});

            modelBuilder.Entity<DepotProduct>(entity =>
{
    entity.HasKey(x => x.Id);

    entity.HasOne(x => x.Depot)
          .WithMany(d => d.DepotProducts)
          .HasForeignKey(x => x.DepotId)
          .OnDelete(DeleteBehavior.Cascade);

    entity.HasOne(x => x.Product)
          .WithMany(p => p.DepotProducts)
          .HasForeignKey(x => x.ProductId)
          .OnDelete(DeleteBehavior.Cascade);

    entity.HasIndex(x => new { x.DepotId, x.ProductId })
          .IsUnique();

    entity.Property(x => x.Quantity)
          .IsRequired();
});


    }
}
