using System.Text;
using Auth.Application.DTOs.Auth;
using Auth.Application.Options;
using Auth.Infrastructure.Extensions;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using Auth.Infrastructure.Logistics.Context;
using Microsoft.EntityFrameworkCore;
using Auth.Infrastructure.Persistence; 
using Auth.Infrastructure.Services;
using Microsoft.OpenApi.Models;
using Auth.Application.Services;


var builder = WebApplication.CreateBuilder(args);

builder.Services.AddInfrastructure(builder.Configuration);

builder.Services.AddCors(opt =>
{
    opt.AddPolicy("frontend", p =>
        p.WithOrigins("http://localhost:3000")
         .AllowAnyHeader()
         .AllowAnyMethod()
         .AllowCredentials());   
});


builder.Services.AddDbContext<AuthDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("AuthConnection")));

builder.Services.AddDbContext<LogisticsDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("LogisticsConnection")));

var jwt = builder.Configuration.GetSection("Jwt").Get<JwtOptions>() ?? new JwtOptions();
builder.Services.AddSingleton(jwt);

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(o =>
    {
        o.TokenValidationParameters = new()
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwt.Issuer,
            ValidAudience = jwt.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.Key)),
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo { Title = "Auth.Api", Version = "v1" });

   
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Bearer {token} formatında JWT giriniz."
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

builder.Services.AddControllers(); 
builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.SuppressModelStateInvalidFilter = false;
});
builder.Services.AddScoped<Auth.Application.Services.ITruckService, Auth.Infrastructure.Services.TruckService>();
builder.Services.AddScoped<Auth.Application.Services.IOrderService, Auth.Infrastructure.Services.OrderService>();
builder.Services.AddScoped<Auth.Application.Abstractions.Services.IAuthService, Auth.Infrastructure.Services.Auth.AuthService>();


var app = builder.Build();

app.UseCors("frontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers(); 

app.UseSwagger();
app.UseSwaggerUI();




app.MapGet("/api/health", () => Results.Ok(new { status = "ok" }))
   .WithTags("Auth.Api");

var authGroup = app.MapGroup("/api/auth").WithTags("Auth");

// Register
authGroup.MapPost("/register",
    async Task<IResult> ([FromBody] RegisterRequest req,
                         Auth.Application.Abstractions.Services.IAuthService auth,
                         CancellationToken ct) =>
    {
        if (string.IsNullOrWhiteSpace(req.Email) || string.IsNullOrWhiteSpace(req.Password))
            return Results.BadRequest(new { error = "Email and password are required." });

        var (ok, token, error) = await auth.RegisterAsync(req.Email, req.Password, req.Role ?? "User", ct);
        return ok ? Results.Ok(new { token }) : Results.BadRequest(new { error });
    })
    .WithName("Register")
    .WithOpenApi();


    authGroup.MapPost("/login",
    async Task<IResult> ([FromBody] LoginRequest req,
                         Auth.Application.Abstractions.Services.IAuthService auth,
                         CancellationToken ct) =>
    {
        if (string.IsNullOrWhiteSpace(req.Email) || string.IsNullOrWhiteSpace(req.Password))
            return Results.BadRequest(new { error = "Email and password are required." });

        var (ok, token, error) = await auth.LoginAsync(req.Email, req.Password, ct);
        return ok ? Results.Ok(new { token }) : Results.BadRequest(new { error });
    })
    .WithName("Login")
    .WithOpenApi();


authGroup.MapGet("/profile",
    [Authorize] (ClaimsPrincipal user) =>
    {
        var email = user.Identity?.Name;
        var roles = user.Claims
                        .Where(c => c.Type == ClaimTypes.Role)
                        .Select(c => c.Value)
                        .ToList();

        return Results.Ok(new
        {
            email,
            roles
        });
    })
    .WithName("Profile")
    .WithOpenApi();


app.Run();
