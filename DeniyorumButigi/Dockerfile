FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build-env
WORKDIR /app

# Copy everything
COPY . ./
# Restore as distinct layers
RUN dotnet restore DeniyorumButigi.Api/DeniyorumButigi.Api.csproj

# Build and publish a release
RUN dotnet publish DeniyorumButigi.Api/DeniyorumButigi.Api.csproj -c Release -o out

# Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build-env /app/out .

# Expose port (Render expects 80 or 8080 usually, we'll expose 8080)
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "DeniyorumButigi.Api.dll"]
